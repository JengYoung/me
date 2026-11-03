import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, onTestFinished, test } from 'vitest';
import { publishPost, nextVersion } from './publish-post';
import { validatePosts } from './validate-posts';

const publishedAt = '2026-10-22T15:00:00+09:00';
async function workspace(body: string, filename = '0.0.0.local.md') {
  const root = await mkdtemp(path.join(tmpdir(), 'me-publication-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'posts', 'article');
  await mkdir(directory, { recursive: true });
  const source = `---\ntitle: 작성 중\nsummary: 설명\npublishedAt: ""\ncustom: 유지\n---\n\n${body}\n`;
  await writeFile(path.join(directory, filename), source);
  return {
    contentRoot: root,
    directory,
    source,
    draft: path.join(directory, filename),
    postId: 'article',
    publishedAt,
  };
}

test('첫 발행은 실제 형식의 local Markdown과 이미지로 새 공개 파일만 준비한다', async () => {
  const input = await workspace('## 본문\n\n![원본 이미지](./picture.png)');
  await writeFile(path.join(input.directory, 'picture.png'), 'original-image');
  const result = await publishPost(input);
  expect(result).toMatchObject({ previous: undefined, version: '1.0.0', added: ['1.0.0.picture.png'], reused: [] });
  const published = await readFile(result.filename, 'utf8');
  expect(published).toContain('./1.0.0.picture.png');
  expect(published).toContain('custom: 유지');
  expect(published).not.toContain('reason:');
  expect(await readFile(input.draft, 'utf8')).toBe(input.source);
  expect(await readFile(path.join(input.directory, 'picture.png'), 'utf8')).toBe('original-image');
  expect(await validatePosts({ contentRoot: input.contentRoot })).toMatchObject({ published: 1, drafts: 0 });
});

test('같은 초안 이미지도 내용이 그대로면 재사용하고, 실제 변경된 이미지에만 새 버전을 만든다', async () => {
  const input = await workspace('## 본문\n\n![이미지](./0.0.0.picture.png)');
  const image = path.join(input.directory, '0.0.0.picture.png');
  await writeFile(image, 'original');
  const first = await publishPost(input);
  const original = await readFile(first.filename, 'utf8');
  const second = await publishPost({ ...input, bump: 'patch', reason: '표현 정리' });
  expect(second).toMatchObject({ version: '1.0.1', added: [], reused: ['1.0.0.picture.png'] });
  expect(await readFile(second.filename, 'utf8')).toContain('reason: 표현 정리');
  await writeFile(image, 'changed');
  const third = await publishPost({ ...input, bump: 'minor' });
  expect(third).toMatchObject({ version: '1.1.0', added: ['1.1.0.picture.png'] });
  expect(await readFile(first.filename, 'utf8')).toBe(original);
  expect(await readFile(path.join(input.directory, '1.0.0.picture.png'), 'utf8')).toBe('original');
  expect(await readFile(path.join(input.directory, '1.1.0.picture.png'), 'utf8')).toBe('changed');
  expect((await readdir(input.directory)).filter((name) => name.endsWith('.png'))).toHaveLength(3);
});

test('MDX의 import·JSX·참조형 Markdown 이미지에 동일한 파일을 쓰고 코드 예제는 보존한다', async () => {
  const body =
    'import picture from "./0.0.0.picture.png"\n\n## 이미지\n\n<ArticleImage src={picture} alt="가져온 그림" />\n\n<ArticleImage src="./0.0.0.picture.png" alt="직접 그림" />\n\n![참조][figure]\n\n[figure]: ./0.0.0.picture.png\n\n```md\n![예시](./0.0.0.picture.png)\n```';
  const input = await workspace(body, '0.0.0.mdx');
  await writeFile(path.join(input.directory, '0.0.0.picture.png'), 'image');
  const result = await publishPost(input);
  const source = await readFile(result.filename, 'utf8');
  expect(result.added).toEqual(['1.0.0.picture.png']);
  expect(source).toContain('import picture from "./1.0.0.picture.png"');
  expect(source).toContain('src={"./1.0.0.picture.png"}');
  expect(source).toContain('[figure]: ./1.0.0.picture.png');
  expect(source).toContain('```md\n![예시](./0.0.0.picture.png)\n```');
});

test.each([
  ['## 본문\n\n![누락](./missing.png)', publishedAt],
  ['# 잘못된 본문 제목', publishedAt],
  ['## 본문', '2026-10-22'],
])('검증 실패 시 공개 파일·잠금 파일을 남기지 않는다: %s', async (body, date) => {
  const input = await workspace(body);
  await expect(publishPost({ ...input, publishedAt: date })).rejects.toThrow();
  expect(await readdir(input.directory)).toEqual(['0.0.0.local.md']);
  expect(await readFile(input.draft, 'utf8')).toBe(input.source);
});

test('공개 이미지 경로 충돌을 덮어쓰지 않고, dry-run은 파일을 추가하지 않는다', async () => {
  const input = await workspace('## 본문\n\n![그림](./picture.png)');
  const target = path.join(input.directory, '1.0.0.picture.png');
  await writeFile(path.join(input.directory, 'picture.png'), 'draft-image');
  await writeFile(target, 'existing-image');
  await expect(publishPost(input)).rejects.toThrow('덮어쓸');
  expect(await readFile(target, 'utf8')).toBe('existing-image');
  await rm(target);
  const before = await readdir(input.directory);
  expect(await publishPost({ ...input, dryRun: true })).toMatchObject({ dryRun: true, version: '1.0.0' });
  expect(await readdir(input.directory)).toEqual(before);
});

test.each([
  [undefined, undefined, '1.0.0'],
  ['1.9.9', 'major', '2.0.0'],
  ['1.9.9', 'minor', '1.10.0'],
  ['1.9.9', 'patch', '1.9.10'],
] as const)('버전 분류 %s / %s → %s', (current, bump, expected) => {
  expect(nextVersion(current, bump)).toBe(expected);
});
