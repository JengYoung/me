import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseFrontmatter } from '../../../shared/lib/frontmatter/index.ts';
import { parsePostMetadataFields } from '../model/metadata.ts';
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

export function parsePostMetadata(source: string, filename: string, isDraft = false): PostMetadata {
  return parsePostMetadataFields(parseFrontmatter(source, filename), filename, isDraft);
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
