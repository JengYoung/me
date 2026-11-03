import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, onTestFinished, test } from 'vitest';
import { loadDiary, parseDiaryMetadata } from './load-diary';

async function workspace(files: Record<string, string>) {
  const root = await mkdtemp(path.join(tmpdir(), 'me-diary-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  for (const [file, source] of Object.entries(files)) {
    const filename = path.join(root, 'diary', file);
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, source);
  }
  return root;
}

const source = (title: string, date: string, publishedAt = '', extra = '') =>
  `---\ntitle: ${title}\nentryDate: "${date}"\npublishedAt: "${publishedAt}"\n${extra}---\n\n본문`;

test('연도 폴더의 여러 기록을 날짜로 정렬하고 같은 날짜의 기록도 별개 ID로 유지한다', async () => {
  const root = await workspace({
    '2025/first.mdx': source('작년 일기', '2025-10-01', '2026-10-22T12:00:00+09:00'),
    '2026/later.mdx': source('나중 일기', '2026-10-20', '2026-10-21T12:00:00+09:00'),
    '2026/another.mdx': source('같은 날', '2026-10-20', '2026-10-21T12:00:00+09:00'),
  });
  const documents = await loadDiary(root);
  expect(documents.map(({ entry }) => entry.id)).toEqual(['another', 'later', 'first']);
  expect(documents[0]?.entry).toEqual({
    id: 'another',
    title: '같은 날',
    entryDate: '2026-10-20',
    publishedAt: '2026-10-21T12:00:00+09:00',
    summary: '',
    tags: [],
  });
});

test('발행 시각이 없는 초안·local 원고·기존 md를 공개하지 않는다', async () => {
  const root = await workspace({
    '2026/draft.mdx': source('초안', '2026-10-20'),
    '2026/local.local.mdx': source('개인 원고', '2026-10-21', '2026-10-22T12:00:00+09:00'),
    '261015.md': '예전 일기를 자동 공개하지 않는다.',
    '2026/261016.md': '연도 폴더의 예전 일기도 자동 공개하지 않는다.',
  });
  expect(await loadDiary(root)).toEqual([]);
  const preview = await loadDiary(root, { includeDrafts: true });
  expect(preview.map(({ entry }) => entry.id)).toEqual(['local', 'draft']);
  expect(preview.every(({ entry }) => entry.isDraft)).toBe(true);
  expect(preview.find(({ entry }) => entry.id === 'draft')?.entry.publishedAt).toBe('');
});

test.each([
  'series: { id: daily, order: 1 }',
  'version: 1.0.0',
  'revisions: []',
  'history: []',
  'reason: 수정',
  'status: draft',
])('일기에 포스트 전용 필드를 추가할 수 없다: %s', (field) => {
  expect(() => parseDiaryMetadata(source('일기', '2026-10-22', '', `${field}\n`), '2026/daily.mdx')).toThrow(
    '시리즈·히스토리',
  );
});

test.each(['2026-02-30', '2026-13-01', '2026-1-01', ''])('기록 날짜의 형식과 실제 날짜를 검증한다: %s', (date) => {
  expect(() => parseDiaryMetadata(source('일기', date), '2026/daily.mdx')).toThrow('entryDate');
});

test('발행 시각에 시간대가 필요하고 기록 날짜와 구분한다', () => {
  expect(() => parseDiaryMetadata(source('일기', '2026-10-22', '2026-10-22'), '2026/daily.mdx')).toThrow('publishedAt');
});

test('버전 파일과 같은 ID의 복수 원고를 거부한다', async () => {
  const root = await workspace({ '2026/1.0.0.mdx': source('일기', '2026-10-22') });
  await expect(loadDiary(root)).rejects.toThrow('버전 파일');
  const duplicate = await workspace({
    '2026/daily.mdx': source('일기', '2026-10-22'),
    '2026/daily.local.mdx': source('로컬', '2026-10-22'),
  });
  await expect(loadDiary(duplicate)).rejects.toThrow('하나만');
});

test('다른 연도·local 원고와 ID가 중복되면 공개·미리보기 모두 거부한다', async () => {
  const root = await workspace({
    '2025/daily.local.mdx': source('작년 초안', '2025-10-22'),
    '2026/daily.mdx': source('올해 공개', '2026-10-22', '2026-10-22T12:00:00+09:00'),
  });
  await expect(loadDiary(root)).rejects.toThrow('모든 연도에서 하나만');
  await expect(loadDiary(root, { includeDrafts: true })).rejects.toThrow('모든 연도에서 하나만');
});

test.each([
  ['daily.mdx', 'diary/{year}/{entryId}.mdx'],
  ['daily/entry.mdx', '연도 폴더'],
  ['26/daily.mdx', '연도 폴더'],
  ['2025/daily.mdx', 'entryDate의 연도'],
  ['2026/Invalid.mdx', 'entryId'],
])('연도별 저장 경로와 기록 날짜를 검증한다: %s', async (filename, message) => {
  const root = await workspace({ [filename]: source('일기', '2026-10-22') });
  await expect(loadDiary(root, { includeDrafts: true })).rejects.toThrow(message);
});
