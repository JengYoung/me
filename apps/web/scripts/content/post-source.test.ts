import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, onTestFinished, test } from 'vitest';
import { loadPosts } from '../../entities/post/api/load-posts';
import { createPost, parseTags, writingContext } from './post-source';

async function workspace() {
  const root = await mkdtemp(path.join(tmpdir(), 'me-writing-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('새 글은 입력한 메타데이터로 비공개 MDX를 만들고 날짜를 지어내지 않는다', async () => {
  const contentRoot = await workspace();
  expect((await writingContext(contentRoot)).ids.size).toBe(0);
  const filename = await createPost({
    contentRoot,
    postId: 'react-memo',
    title: 'React: "최적화"',
    summary: '@memo 이야기',
    tags: parseTags(' React, TS,React, '),
    local: true,
  });
  expect(filename).toBe(path.join(contentRoot, 'posts/react-memo/0.0.0.local.mdx'));
  expect(await loadPosts(contentRoot)).toEqual([]);
  const posts = await loadPosts(contentRoot, { includeDrafts: true });
  expect(posts[0]?.latest.post).toMatchObject({
    title: 'React: "최적화"',
    summary: '@memo 이야기',
    tags: ['React', 'TS'],
    publishedAt: '',
    isDraft: true,
  });
  expect(await readFile(filename, 'utf8')).toContain('## 시작하며');
});

test('같은 ID·경로 이탈·중복 시리즈 순번을 거부하고 기존 원고를 보존한다', async () => {
  const contentRoot = await workspace();
  const input = { contentRoot, postId: 'first', title: '원본', series: { id: 'react', order: 1 } };
  const filename = await createPost(input);
  const original = await readFile(filename, 'utf8');
  await expect(createPost({ ...input, title: '덮어쓰기' })).rejects.toThrow('같은 ID');
  await expect(createPost({ ...input, postId: '../outside' })).rejects.toThrow('글 ID');
  await expect(createPost({ ...input, postId: 'second' })).rejects.toThrow('순번');
  expect(await readFile(filename, 'utf8')).toBe(original);
});
