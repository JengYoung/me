import { mkdtemp, mkdir, readFile, realpath, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, onTestFinished, test } from 'vitest';
import { seriesImagePath, synchronizeSeries, validateSeries } from './series-source';
import { generateSeries } from '../generate-series';

async function workspace(files: Record<string, string>) {
  const root = await mkdtemp(path.join(tmpdir(), 'me-series-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  for (const [name, source] of Object.entries(files)) {
    const filename = path.join(root, name);
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, source);
  }
  return realpath(root);
}

function post(id: string, order: number, date = '2026-10-20T10:00:00+09:00') {
  return `---\ntitle: 글 ${order}\npublishedAt: "${date}"\nseries: { id: ${id}, order: ${order} }\n---\n본문은 목록에 포함하지 않는다`;
}
const definitions = JSON.stringify([{ id: 'a', title: '직접 쓴 제목', description: '직접 쓴 소개', thumbnail: '' }]);

test('새 시리즈를 빈 제목·소개로 남기고 빌드 검증에서 수정 경로와 필드를 알려준다', async () => {
  const root = await workspace({ 'posts/first/1.0.0.mdx': post('a', 10) });
  await expect(validateSeries(root)).rejects.toThrow(/series\.json.*a\.title.*a\.description/);
  const filename = path.join(root, 'series/series.json');
  expect(JSON.parse(await readFile(filename, 'utf8'))[0]).toMatchObject({ id: 'a', title: '', description: '' });
  await writeFile(filename, definitions);
  expect(await validateSeries(root)).toBe(1);
  await writeFile(filename, JSON.stringify([{ id: 'a', title: '  ', description: '\n' }]));
  await expect(validateSeries(root)).rejects.toThrow(/a\.title.*a\.description/);
});

test('재수집은 작성 필드를 보존하고 최신 공개 버전만 정렬하며 같은 입력을 다시 쓰지 않는다', async () => {
  const root = await workspace({
    'series/series.json': definitions,
    'posts/first/1.0.0.mdx': post('a', 99),
    'posts/first/1.10.0.mdx': post('a', 10, '2026-10-22T10:00:00+09:00'),
    'posts/second/1.0.0.mdx': post('a', 30),
  });
  const { filename, series } = await synchronizeSeries(root);
  expect(series[0]!.posts.map((item) => item.id)).toEqual(['first', 'second']);
  expect(series[0]!.postCount).toBe(2);
  expect(series[0]!.updatedAt).toBe('2026-10-22T10:00:00+09:00');
  const original = await readFile(filename, 'utf8');
  expect(JSON.parse(original)[0]).toMatchObject({
    title: '직접 쓴 제목',
    description: '직접 쓴 소개',
    thumbnail: '',
    derived: {
      posts: [
        { id: 'first', order: 10 },
        { id: 'second', order: 30 },
      ],
      postCount: 2,
    },
  });
  const modified = (await stat(filename)).mtimeMs;
  await synchronizeSeries(root);
  expect(await readFile(filename, 'utf8')).toBe(original);
  expect((await stat(filename)).mtimeMs).toBe(modified);
  expect(original).not.toContain('본문은');
});

test('미리보기의 초안 소속·제목은 공개 JSON 집계와 공개 런타임 모듈을 오염시키지 않는다', async () => {
  const root = await workspace({
    'series/series.json': definitions,
    'posts/first/1.0.0.mdx': post('a', 10),
    'posts/first/0.0.0.local.md': post('b', 20, ''),
    'posts/private/0.0.0.mdx': post('b', 40, ''),
  });
  const outputRoot = path.join(root, 'public-output');
  await generateSeries({ contentRoot: root, outputRoot });
  const publicModule = await readFile(path.join(outputRoot, 'catalog.generated.ts'), 'utf8');
  const previewRoot = path.join(root, 'preview-output');
  await generateSeries({ contentRoot: root, outputRoot: previewRoot, includeDrafts: true });
  const records = JSON.parse(await readFile(path.join(root, 'series/series.json'), 'utf8'));
  expect(records.find((item: { id: string }) => item.id === 'a').derived.posts).toEqual([{ id: 'first', order: 10 }]);
  expect(records.find((item: { id: string }) => item.id === 'b').derived.postCount).toBe(0);
  expect(JSON.stringify(records)).not.toContain('private');
  expect(await readFile(path.join(outputRoot, 'catalog.generated.ts'), 'utf8')).toBe(publicModule);
  expect(publicModule).not.toContain('private');
  expect(await readFile(path.join(previewRoot, 'catalog.generated.ts'), 'utf8')).toContain('private');
});

test('현재 글의 중복 order는 실패하고 과거 버전이나 분리된 초안의 order는 현재 값을 차지하지 않는다', async () => {
  const root = await workspace({
    'series/series.json': definitions,
    'posts/first/1.0.0.mdx': post('a', 20),
    'posts/first/1.0.1.mdx': post('a', 10),
    'posts/first/0.0.0.mdx': post('a', 99, ''),
    'posts/second/1.0.0.mdx': post('a', 20),
  });
  expect((await synchronizeSeries(root)).series[0]!.postCount).toBe(2);
  await writeFile(path.join(root, 'posts/second/1.0.1.mdx'), post('a', 10));
  await expect(synchronizeSeries(root)).rejects.toThrow(/a.*order 10 중복/);
});

test('손상된 JSON과 알 수 없는 작성 필드를 덮어쓰지 않는다', async () => {
  const root = await workspace({ 'series/series.json': '{ invalid' });
  await expect(synchronizeSeries(root)).rejects.toThrow(/series\.json.*JSON 문법/);
  expect(await readFile(path.join(root, 'series/series.json'), 'utf8')).toBe('{ invalid');
  const source = '[{"id":"a","title":"제목","description":"소개","typo":true}]';
  await writeFile(path.join(root, 'series/series.json'), source);
  await expect(synchronizeSeries(root)).rejects.toThrow('알 수 없는 필드');
  expect(await readFile(path.join(root, 'series/series.json'), 'utf8')).toBe(source);
});

test('공개 글이 없는 시리즈는 작성 정보만 보존하고 화면 카탈로그에서는 제외한다', async () => {
  const root = await workspace({ 'series/series.json': definitions });
  const result = await synchronizeSeries(root);
  expect(result.series).toEqual([]);
  expect(result.definitions[0]!.title).toBe('직접 쓴 제목');
  expect(JSON.parse(await readFile(result.filename, 'utf8'))[0].derived).toEqual({
    posts: [],
    postCount: 0,
    updatedAt: null,
  });
});

test('대표 이미지는 시리즈 폴더 안의 파일만 허용하고 외부 심볼릭 링크·누락·비공개 자산을 거부한다', async () => {
  const root = await workspace({ 'series/a/cover.png': 'image', 'outside.png': 'outside' });
  const item = { id: 'a', title: '제목', description: '소개', thumbnail: './a/cover.png' };
  expect(await seriesImagePath(root, item, false)).toBe(path.join(root, 'series/a/cover.png'));
  for (const thumbnail of ['../outside.png', '/outside.png', './missing.png', './a/cover.local.png']) {
    await expect(seriesImagePath(root, { ...item, thumbnail }, false)).rejects.toThrow();
  }
  await symlink(path.join(root, 'outside.png'), path.join(root, 'series/linked.png'));
  await expect(seriesImagePath(root, { ...item, thumbnail: './linked.png' }, false)).rejects.toThrow('밖에');
});

test('공개 화면에 쓰는 대표 이미지만 import하고 초안 전용 시리즈의 이미지·메타데이터는 포함하지 않는다', async () => {
  const root = await workspace({
    'series/series.json': JSON.stringify([
      { id: 'a', title: '공개', description: '소개', thumbnail: './a/cover.png' },
      { id: 'private', title: '비공개', description: '소개', thumbnail: './private/missing.png' },
    ]),
    'posts/first/1.0.0.mdx': post('a', 10),
    'posts/private/0.0.0.mdx': post('private', 10, ''),
    'series/a/cover.png': '',
  });
  await writeFile(
    path.join(root, 'series/a/cover.png'),
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7l8AAAAASUVORK5CYII=',
      'base64',
    ),
  );
  const outputRoot = path.join(root, 'output');
  await generateSeries({ contentRoot: root, outputRoot });
  const generated = await readFile(path.join(outputRoot, 'catalog.generated.ts'), 'utf8');
  expect(generated).toContain('import image0 from "../series/a/cover.png"');
  expect(generated).toContain('thumbnail: image0');
  expect(generated).not.toContain('private');
  expect(JSON.parse(await readFile(path.join(root, 'series/series.json'), 'utf8'))[0].thumbnail).toBe('./a/cover.png');
});
