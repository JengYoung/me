import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, onTestFinished, test } from 'vitest';
import { loadPosts } from './load-posts';

async function workspace(files: Record<string, string>) {
  const root = await mkdtemp(path.join(tmpdir(), 'me-posts-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  for (const [file, source] of Object.entries(files)) {
    const filename = path.join(root, 'posts', file);
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, source);
  }
  return root;
}

function source(title: string, date = '2026-10-20T12:00:00+09:00', extra = '') {
  return `---\ntitle: ${title}\npublishedAt: "${date}"\n${extra}---\n\n본문`;
}

test('최신은 버전 숫자로 선택하고 최초 발행일로 글을 정렬한다', async () => {
  const root = await workspace({
    'first/1.0.0.mdx': source('최초', '2026-09-01T12:00:00+09:00'),
    'first/1.9.0.mdx': source('과거', '2026-10-22T12:00:00+09:00'),
    'first/1.10.0.mdx': source('최신', '2026-10-21T12:00:00+09:00', 'reason: 오타 수정\n'),
    'second/1.0.0.mdx': source('다른 글', '2026-10-01T12:00:00+09:00'),
  });
  const posts = await loadPosts(root);
  expect(posts.map((entry) => entry.latest.post.id)).toEqual(['second', 'first']);
  expect(posts[1]?.latest.post).toMatchObject({
    version: '1.10.0',
    title: '최신',
    createdAt: '2026-09-01T12:00:00+09:00',
    reason: '오타 수정',
  });
  expect(posts[1]?.revisions.map((revision) => revision.version)).toEqual(['1.10.0', '1.9.0', '1.0.0']);
});

test('모든 0.x.x와 local·기존 Markdown은 파싱하거나 공개하지 않는다', async () => {
  const root = await workspace({
    'public/1.0.0.mdx': source('공개'),
    'public/0.8.1.mdx': '---\nmalformed: [',
    'public/2.0.0.local.mdx': source('비공개'),
    'draft/0.0.0.mdx': source('초안'),
    'legacy/기존.md': source('기존 글'),
  });
  const posts = await loadPosts(root);
  expect(posts).toHaveLength(1);
  expect(posts[0]?.releases).toHaveLength(1);
  expect(posts[0]?.latest.post).toMatchObject({ title: '공개', summary: '', tags: [] });
  expect(posts[0]?.revisions[0]).not.toHaveProperty('reason');
});

test.each([
  ['reason: 42\n', 'reason'],
  ['tags: false\n', 'tags'],
  ['series: { id: demo, order: 0 }\n', 'series'],
])('제공된 메타데이터의 타입을 검증한다: %s', async (extra, field) => {
  const root = await workspace({ 'post/1.0.0.mdx': source('글', undefined, extra) });
  await expect(loadPosts(root)).rejects.toThrow(field);
});

test('날짜의 시간대 누락과 최초 공개 버전 누락을 드러낸다', async () => {
  const root = await workspace({ 'post/1.0.0.mdx': source('글', '2026-10-20') });
  await expect(loadPosts(root)).rejects.toThrow('publishedAt');
  const other = await workspace({ 'post/2.0.0.mdx': source('글') });
  await expect(loadPosts(other)).rejects.toThrow('1.0.0');
});

test('로컬 미리보기에서만 실제 형식의 초안을 읽고 비어 있는 날짜를 보존한다', async () => {
  const root = await workspace({
    'post/0.0.0.local.md': source('작성 중인 원고', ''),
    'another/0.1.0.mdx': source('MDX 초안', ''),
  });
  expect(await loadPosts(root)).toEqual([]);
  const preview = await loadPosts(root, { includeDrafts: true });
  expect(preview).toHaveLength(2);
  for (const { latest, revisions } of preview) {
    expect(latest.post).toMatchObject({ publishedAt: '', createdAt: '', isDraft: true });
    expect(revisions).toEqual([]);
  }
});
