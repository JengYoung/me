import { mkdir, open, readFile, readdir, realpath, rmdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { stringify } from 'yaml';
import { docsRoot, postIdError, updateFrontmatter } from './source.ts';
export { docsRoot, postIdError, parseTags, updateFrontmatter } from './source.ts';
import { loadPosts, parsePostMetadata } from '../../entities/post/api/load-posts.ts';
import type { PostMetadata } from '../../entities/post/model/post.ts';

async function writeNewFile(filename: string, source: string) {
  const file = await open(filename, 'wx');
  try {
    await file.writeFile(source);
  } catch (error) {
    await unlink(filename);
    throw error;
  } finally {
    await file.close();
  }
}

export async function writingContext(contentRoot = docsRoot) {
  const entries = await loadPosts(contentRoot, { includeDrafts: true });
  const directories = await readdir(path.join(contentRoot, 'posts'), { withFileTypes: true }).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    },
  );
  const ids = new Set(directories.map((entry) => entry.name));
  const series = new Map<string, Set<number>>();
  for (const entry of entries) {
    const relation = entry.latest.post.series;
    if (!relation) continue;
    const orders = series.get(relation.id) ?? new Set<number>();
    orders.add(relation.order);
    series.set(relation.id, orders);
  }
  return { entries, ids, series };
}

export async function postDirectory(contentRoot: string, postId: string) {
  const error = postIdError(postId);
  if (error) throw new Error(error);
  const postsRoot = await realpath(path.join(contentRoot, 'posts'));
  const directory = await realpath(path.join(postsRoot, postId));
  if (path.dirname(directory) !== postsRoot) throw new Error('글 폴더가 docs/posts 밖을 가리킵니다.');
  return directory;
}

export async function createPost({
  contentRoot = docsRoot,
  postId,
  title,
  summary = '',
  tags = [],
  series,
  local = false,
}: {
  contentRoot?: string;
  postId: string;
  title: string;
  summary?: string;
  tags?: string[];
  series?: PostMetadata['series'];
  local?: boolean;
}) {
  const error = postIdError(postId);
  if (error) throw new Error(error);
  await mkdir(path.join(contentRoot, 'posts'), { recursive: true });
  const context = await writingContext(contentRoot);
  if (context.ids.has(postId)) throw new Error(`이미 같은 ID의 글이 있습니다: ${postId}`);
  if (series && context.series.get(series.id)?.has(series.order))
    throw new Error('다른 글·초안에서 사용 중인 시리즈 정렬값입니다.');
  const data = { title, summary, publishedAt: '', tags, ...(series ? { series } : {}) };
  const source = `---\n${stringify(data, { lineWidth: 0 })}---\n\n## 시작하며\n\n본문을 작성하세요.\n`;
  const directory = path.join(contentRoot, 'posts', postId);
  const filename = path.join(directory, local ? '0.0.0.local.mdx' : '0.0.0.mdx');
  parsePostMetadata(source, filename, true);
  await mkdir(directory);
  try {
    await writeNewFile(filename, source);
  } catch (error) {
    // 다른 프로세스가 추가한 파일까지 지우지 않는다.
    await rmdir(directory).catch(() => {});
    throw error;
  }
  return filename;
}

export async function editPost({
  contentRoot = docsRoot,
  postId,
  local = false,
}: {
  contentRoot?: string;
  postId: string;
  local?: boolean;
}) {
  const directory = await postDirectory(contentRoot, postId);
  const entry = (await loadPosts(contentRoot, { includeDrafts: true })).find(
    (entry) => entry.latest.post.id === postId,
  );
  if (!entry) throw new Error(`수정할 원고가 없습니다: ${postId}`);
  if (entry.latest.post.isDraft) return { filename: await realpath(entry.latest.sourcePath), created: false };
  const filename = path.join(directory, local ? '0.0.0.local.mdx' : '0.0.0.mdx');
  const source = updateFrontmatter(await readFile(entry.latest.sourcePath, 'utf8'), {
    publishedAt: '',
    reason: undefined,
  });
  await writeNewFile(filename, source);
  return { filename, created: true };
}
