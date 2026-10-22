import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, onTestFinished, test } from 'vitest';
import { loadPosts } from '../../entities/post/api/load-posts';
import { createPost, editPost, parseTags, writingContext } from './post-source';

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

test('수정 초안은 번호상 최신 공개 본문과 이미지 참조를 유지하고 기존 초안은 덮어쓰지 않는다', async () => {
  const contentRoot = await workspace();
  const directory = path.join(contentRoot, 'posts', 'react');
  await mkdir(directory, { recursive: true });
  const header = '---\ntitle: 글\npublishedAt: "2026-10-22T10:00:00+09:00"\nreason: 이전 변경\n---\n\n';
  for (const version of ['1.0.0', '1.9.0', '1.10.0'])
    await writeFile(path.join(directory, `${version}.mdx`), `${header}## ${version}\n\n![보존](./1.0.0.picture.png)\n`);
  const result = await editPost({ contentRoot, postId: 'react' });
  expect(result.created).toBe(true);
  const source = await readFile(result.filename, 'utf8');
  expect(source).toContain('## 1.10.0');
  expect(source).toContain('./1.0.0.picture.png');
  expect(source).not.toContain('reason:');
  const post = (await loadPosts(contentRoot, { includeDrafts: true }))[0]!.latest.post;
  expect(post.publishedAt).toBe('');
  await writeFile(result.filename, `${source}\n작성 중`);
  expect(await editPost({ contentRoot, postId: 'react' })).toEqual({ filename: result.filename, created: false });
  expect(await readFile(result.filename, 'utf8')).toContain('작성 중');
  expect(await readFile(path.join(directory, '1.10.0.mdx'), 'utf8')).toBe(
    `${header}## 1.10.0\n\n![보존](./1.0.0.picture.png)\n`,
  );
});
