import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';
import { compareVersions, isPublicVersion } from '../model/post.ts';
import type { Post, PostMetadata, PostRevision } from '../model/post.ts';

export interface PostRelease {
  post: Post;
  sourcePath: string;
}

export interface PostEntry {
  latest: PostRelease;
  releases: PostRelease[];
  revisions: PostRevision[];
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parsePostMetadata(source: string, filename: string, isDraft = false): PostMetadata {
  function fail(message: string): never {
    throw new Error(`${filename}: ${message}`);
  }
  const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) return fail('frontmatter가 필요합니다.');
  let data: unknown;
  try {
    data = parse(match[1]!);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'frontmatter를 읽을 수 없습니다.');
  }
  if (!record(data)) return fail('frontmatter는 객체여야 합니다.');
  if (typeof data.title !== 'string' || !data.title.trim()) return fail('title은 빈 문자열일 수 없습니다.');
  if (
    !(isDraft && (data.publishedAt === undefined || data.publishedAt === '')) &&
    (typeof data.publishedAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(data.publishedAt) ||
      !Number.isFinite(Date.parse(data.publishedAt)))
  )
    return fail('publishedAt에 시간대가 포함된 발행 시각을 작성하세요.');
  if (data.summary !== undefined && typeof data.summary !== 'string') return fail('summary는 문자열이어야 합니다.');
  if (data.reason !== undefined && typeof data.reason !== 'string') return fail('reason은 문자열이어야 합니다.');
  if (data.tags !== undefined && (!Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === 'string'))) {
    return fail('tags는 문자열 배열이어야 합니다.');
  }
  if (
    data.series !== undefined &&
    (!record(data.series) ||
      typeof data.series.id !== 'string' ||
      !data.series.id.trim() ||
      typeof data.series.order !== 'number' ||
      !Number.isSafeInteger(data.series.order) ||
      data.series.order < 1)
  )
    return fail('series에는 id와 1 이상의 정수 order가 필요합니다.');
  return {
    title: data.title,
    summary: (data.summary as string | undefined) ?? '',
    publishedAt: (data.publishedAt as string | undefined) ?? '',
    tags: (data.tags as string[] | undefined) ?? [],
    ...(data.reason === undefined ? {} : { reason: data.reason as string }),
    ...(data.series === undefined ? {} : { series: data.series as PostMetadata['series'] }),
  };
}

/** 기본은 공개 MDX만 읽는다. 초안은 로컬 미리보기 명령에서만 명시적으로 요청한다. */
export async function loadPosts(contentRoot: string, { includeDrafts = false } = {}): Promise<PostEntry[]> {
  const postsRoot = path.join(contentRoot, 'posts');
  const directories = await readdir(postsRoot, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  const entries = await Promise.all(
    directories
      .filter((entry) => entry.isDirectory())
      .map(async (directory) => {
        const files = await readdir(path.join(postsRoot, directory.name), { withFileTypes: true });
        const versions = files.filter(
          (file) => file.isFile() && file.name.endsWith('.mdx') && isPublicVersion(file.name.slice(0, -4)),
        );
        const drafts = includeDrafts
          ? files.filter(
              (file) => file.isFile() && /^0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:\.local)?\.mdx?$/.test(file.name),
            )
          : [];
        if (!versions.length && !drafts.length) return undefined;
        if (/[/\\%?#]/.test(directory.name) || directory.name.startsWith('.')) {
          throw new Error(`posts/${directory.name}: URL에서 구분할 수 있는 postId를 사용하세요.`);
        }
        const collected = await Promise.all(
          versions.map(async (file) => {
            const sourcePath = path.join(postsRoot, directory.name, file.name);
            return {
              post: {
                ...parsePostMetadata(await readFile(sourcePath, 'utf8'), sourcePath),
                id: directory.name,
                version: file.name.slice(0, -4),
                createdAt: '',
              },
              sourcePath,
            };
          }),
        );
        const releases = [...collected].sort((a, b) => compareVersions(a.post.version, b.post.version));
        const first = releases[0];
        if (first && first.post.version !== '1.0.0')
          throw new Error(`${directory.name}: 최초 공개 버전 1.0.0.mdx가 필요합니다.`);
        for (const release of releases) release.post.createdAt = first!.post.publishedAt;
        let latest: PostRelease | undefined = releases.at(-1);
        const draft = [...drafts]
          .sort((a, b) =>
            compareVersions(a.name.split('.').slice(0, 3).join('.'), b.name.split('.').slice(0, 3).join('.')),
          )
          .at(-1);
        if (draft) {
          const version = draft.name.split('.').slice(0, 3).join('.');
          if (drafts.filter((file) => file.name.startsWith(`${version}.`)).length > 1) {
            throw new Error(`${directory.name}: 같은 초안 버전 ${version}의 파일이 여러 개입니다.`);
          }
          const sourcePath = path.join(postsRoot, directory.name, draft.name);
          latest = {
            post: {
              ...parsePostMetadata(await readFile(sourcePath, 'utf8'), sourcePath, true),
              id: directory.name,
              version,
              createdAt: first?.post.publishedAt ?? '',
              isDraft: true,
            },
            sourcePath,
          };
        }
        return {
          latest: latest!,
          releases,
          revisions: [...releases].reverse().map(({ post }) => ({
            version: post.version,
            publishedAt: post.publishedAt,
            ...(post.reason === undefined ? {} : { reason: post.reason }),
          })),
        };
      }),
  );
  const published = entries.filter((entry): entry is PostEntry => entry !== undefined);
  // oxlint-disable-next-line unicorn/no-array-sort -- 이 함수에서 filter로 생성한 새 배열만 정렬한다.
  return published.sort(
    (a, b) =>
      (Date.parse(b.latest.post.createdAt) || 0) - (Date.parse(a.latest.post.createdAt) || 0) ||
      a.latest.post.id.localeCompare(b.latest.post.id),
  );
}
