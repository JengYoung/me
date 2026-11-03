import { mkdtemp, open, readFile, realpath, rm, stat, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadPosts, parsePostMetadata } from '../../entities/post/api/load-posts.ts';
import { isPublicVersion } from '../../entities/post/model/post.ts';
import { articleImages } from './article-images.mjs';
import { docsRoot, postDirectory, updateFrontmatter } from './post-source.ts';
import { validatePostFile, validatePosts } from './validate-posts.ts';

export type Bump = 'major' | 'minor' | 'patch';

export function nextVersion(current: string | undefined, bump?: Bump) {
  if (!current) return '1.0.0';
  if (!bump) throw new Error('수정 발행에는 --bump major|minor|patch가 필요합니다.');
  const [major, minor, patch] = current.split('.').map(BigInt) as [bigint, bigint, bigint];
  if (bump === 'major') return `${major + 1n}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1n}.0`;
  return `${major}.${minor}.${patch + 1n}`;
}

export async function publishPost({
  contentRoot = docsRoot,
  postId,
  bump,
  publishedAt,
  reason,
  from,
  dryRun = false,
}: {
  contentRoot?: string;
  postId: string;
  bump?: Bump;
  publishedAt: string;
  reason?: string;
  from?: string;
  dryRun?: boolean;
}) {
  const directory = await postDirectory(contentRoot, postId);
  const lockPath = path.join(directory, '.publish.lock');
  const lock = await open(lockPath, 'wx').catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'EEXIST')
      throw new Error(
        '이 글의 발행 작업이 실행 중입니다. 중단된 작업의 .publish.lock은 실행 중인 작업이 없음을 확인한 뒤 제거하세요.',
      );
    throw error;
  });
  const written: string[] = [];
  try {
    await validatePosts({ contentRoot });
    const entry = (await loadPosts(contentRoot, { includeDrafts: true })).find(
      (entry) => entry.latest.post.id === postId,
    );
    if (!entry?.latest.post.isDraft) throw new Error('발행할 초안이 없습니다. post:edit로 초안을 준비하세요.');
    if (from && !/^0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:\.local)?\.mdx?$/.test(from))
      throw new Error('--from에는 같은 글 폴더의 초안 파일명만 지정하세요.');
    const sourcePath = from ? path.join(directory, from) : entry.latest.sourcePath;
    if (path.dirname(await realpath(sourcePath)) !== directory)
      throw new Error('초안은 같은 글 폴더의 파일이어야 합니다.');
    const original = await readFile(sourcePath, 'utf8');
    const previous = entry.releases.at(-1)?.post.version;
    const version = nextVersion(previous, bump);
    const filename = path.join(directory, `${version}.mdx`);
    const references = articleImages(original, sourcePath);
    const images = new Map<string, Buffer>();
    const publishedImages = new Map<string, Buffer>();
    for (const release of [...entry.releases].reverse()) {
      const publicSource = await readFile(release.sourcePath, 'utf8');
      for (const reference of articleImages(publicSource, release.sourcePath).sources) {
        if (!publishedImages.has(reference))
          publishedImages.set(reference, await readFile(path.resolve(directory, reference)));
      }
    }
    const added = new Map<string, Buffer>();
    const mapping = new Map<string, string>();
    const reused = new Set<string>();
    for (const source of references.sources) {
      if (!/^\.\/[^/\\]+\.(?:png|jpe?g|webp|avif|gif)$/i.test(source))
        throw new Error(`같은 글 폴더의 로컬 이미지가 필요합니다: ${source}`);
      const imagePath = await realpath(path.resolve(directory, source));
      if (path.dirname(imagePath) !== directory || !(await stat(imagePath)).isFile())
        throw new Error(`글 폴더 밖의 이미지입니다: ${source}`);
      const bytes = await readFile(imagePath);
      images.set(source, bytes);
      const name = source.slice(2);
      const prefix = /^(\d+\.\d+\.\d+)\./.exec(name)?.[1];
      if (prefix && isPublicVersion(prefix)) {
        reused.add(name);
        mapping.set(source, source);
        continue;
      }
      const unchanged = [...publishedImages].find(([, published]) => published.equals(bytes));
      if (unchanged) {
        reused.add(unchanged[0].slice(2));
        mapping.set(source, unchanged[0]);
        continue;
      }
      const target = `${version}.${name.replace(/^0\.\d+\.\d+\./, '')}`;
      const duplicate = added.get(target);
      if (duplicate && !duplicate.equals(bytes))
        throw new Error(`서로 다른 이미지가 같은 파일명을 사용합니다: ${target}`);
      const existing = await readFile(path.join(directory, target)).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error;
        return undefined;
      });
      if (existing && !existing.equals(bytes)) throw new Error(`기존 이미지를 덮어쓸 수 없습니다: ${target}`);
      if (existing && path.dirname(await realpath(path.join(directory, target))) !== directory)
        throw new Error(`글 폴더 밖의 이미지입니다: ${target}`);
      if (existing) reused.add(target);
      else added.set(target, bytes);
      mapping.set(source, `./${target}`);
    }
    const source = updateFrontmatter(references.rewrite(mapping), {
      publishedAt,
      ...(reason === undefined ? {} : { reason }),
    });
    const staging = await mkdtemp(path.join(tmpdir(), 'me-publish-'));
    try {
      for (const [reference, bytes] of images)
        await writeFile(path.join(staging, mapping.get(reference)!.slice(2)), bytes);
      await validatePostFile(path.join(staging, `${version}.mdx`), source);
    } finally {
      await rm(staging, { recursive: true, force: true });
    }
    if (
      await stat(filename).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error;
        return undefined;
      })
    )
      throw new Error(`이미 존재하는 공개 버전입니다: ${version}`);
    if ((await readFile(sourcePath, 'utf8')) !== original)
      throw new Error('검사 중 초안이 변경되었습니다. 다시 실행하세요.');
    for (const [reference, bytes] of images) {
      if (!(await readFile(path.resolve(directory, reference))).equals(bytes))
        throw new Error(`검사 중 이미지가 변경되었습니다: ${reference}`);
    }
    if (!dryRun) {
      for (const [name, value] of [...added, [`${version}.mdx`, source] as const]) {
        const target = path.join(directory, name);
        const file = await open(target, 'wx');
        written.push(target);
        try {
          await file.writeFile(value);
        } finally {
          await file.close();
        }
      }
    }
    return {
      postId,
      previous,
      version,
      filename,
      sourcePath,
      publishedAt,
      reason: parsePostMetadata(source, filename).reason,
      added: [...added.keys()],
      reused: [...reused],
      dryRun,
    };
  } catch (error) {
    const cleanup = await Promise.allSettled(written.reverse().map((filename) => unlink(filename)));
    const failures = cleanup.flatMap((result) => (result.status === 'rejected' ? [result.reason] : []));
    if (failures.length)
      throw new AggregateError(
        [error, ...failures],
        '발행 실패 후 생성 파일 정리에도 실패했습니다. 대상 파일을 확인하세요.',
      );
    throw error;
  } finally {
    try {
      await lock.close();
    } finally {
      await unlink(lockPath);
    }
  }
}
