import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, onTestFinished, test, vi } from 'vitest';
import { createDiary, publishDiary } from './content/diary-source';
import { generateDiary } from './generate-diary';

test('일기 생성기는 공개·미리보기를 분리하고 현재 본문만 가져온다', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'me-diary-generation-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  const contentRoot = path.join(root, 'docs');
  const outputRoot = path.join(root, 'public');
  const previewRoot = path.join(root, 'preview');
  await createDiary({ contentRoot, entryId: 'draft', title: '비공개 일기', entryDate: '2026-10-22' });
  await createDiary({ contentRoot, entryId: 'public', title: '공개 일기', entryDate: '2026-10-21' });
  await publishDiary({ contentRoot, entryId: 'public', publishedAt: '2026-10-22T15:00:00+09:00' });
  expect(await generateDiary({ contentRoot, outputRoot })).toEqual({ entries: 1, drafts: 0 });
  expect(await generateDiary({ contentRoot, outputRoot: previewRoot, includeDrafts: true })).toEqual({
    entries: 2,
    drafts: 1,
  });
  expect(await readFile(path.join(outputRoot, 'catalog.generated.ts'), 'utf8')).not.toContain('비공개 일기');
  const current = await readFile(path.join(outputRoot, 'current.generated.ts'), 'utf8');
  expect(current).toContain('2026/public.mdx');
  expect(current).not.toContain('2026/draft.mdx');
  expect(current).not.toMatch(/revisions|series|version|archive/);
  expect(new Set(await readdir(outputRoot))).toEqual(new Set(['catalog.generated.ts', 'current.generated.ts']));
  await rm(path.join(contentRoot, 'diary', '2026', 'public.mdx'));
  await generateDiary({ contentRoot, outputRoot });
  expect(await readFile(path.join(outputRoot, 'current.generated.ts'), 'utf8')).not.toContain('2026/public.mdx');
  expect(await generateDiary({ contentRoot, outputRoot: previewRoot, includeDrafts: true })).toEqual({
    entries: 1,
    drafts: 1,
  });
});

test('프로덕션 환경에서는 일기 초안 생성을 거부한다', async () => {
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });
  vi.stubEnv('NODE_ENV', 'production');
  await expect(generateDiary({ includeDrafts: true })).rejects.toThrow('개발 서버');
});
