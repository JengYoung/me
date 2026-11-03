import { mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, onTestFinished, test } from 'vitest';
import { loadDiary } from '../../entities/diary/api/load-diary';
import { createDiary, editDiary, publishDiary } from './diary-source';
import { validateDiary } from './validate-diary';

async function workspace() {
  const root = await mkdtemp(path.join(tmpdir(), 'me-diary-writing-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('생성·발행·직접 수정 전 과정에서 단일 원고와 이미지 파일을 유지한다', async () => {
  const contentRoot = await workspace();
  const filename = await createDiary({ contentRoot, entryId: 'daily', title: '일상', entryDate: '2026-10-22' });
  expect(filename).toBe(path.join(contentRoot, 'diary', '2026', 'daily.mdx'));
  const directory = path.dirname(filename);
  await writeFile(path.join(directory, 'walk.png'), 'image');
  await writeFile(filename, `${await readFile(filename, 'utf8')}\n![산책](./walk.png)\n`);
  const before = await readFile(filename, 'utf8');
  expect(await loadDiary(contentRoot)).toEqual([]);
  await publishDiary({ contentRoot, entryId: 'daily', publishedAt: '2026-10-22T15:00:00+09:00', dryRun: true });
  expect(await readFile(filename, 'utf8')).toBe(before);
  await publishDiary({ contentRoot, entryId: 'daily', publishedAt: '2026-10-22T15:00:00+09:00' });
  expect(await editDiary({ contentRoot, entryId: 'daily' })).toBe(await realpath(filename));
  const published = await readFile(filename, 'utf8');
  await writeFile(filename, published.replace('본문을 작성하세요.', '산책하며 생각을 정리했다.'));
  await publishDiary({ contentRoot, entryId: 'daily' });
  expect(new Set(await readdir(directory))).toEqual(new Set(['daily.mdx', 'walk.png']));
  expect(await readFile(filename, 'utf8')).toContain('산책하며 생각을 정리했다.');
  expect(await readFile(filename, 'utf8')).toContain('./walk.png');
  expect((await loadDiary(contentRoot))[0]?.entry.publishedAt).toBe('2026-10-22T15:00:00+09:00');
  expect(await validateDiary({ contentRoot })).toEqual({ published: 1, drafts: 0 });
});

test('local 초안은 검증 후 같은 원고를 공개 파일명으로 전환한다', async () => {
  const contentRoot = await workspace();
  const filename = await createDiary({
    contentRoot,
    entryId: 'daily',
    title: '일상',
    entryDate: '2026-10-22',
    local: true,
  });
  await publishDiary({ contentRoot, entryId: 'daily', publishedAt: '2026-10-22T15:00:00+09:00' });
  expect(await readdir(path.dirname(filename))).toEqual(['daily.mdx']);
  expect(await loadDiary(contentRoot)).toHaveLength(1);
});

test('잘못된 발행 시각·이미지는 원고를 변경하지 않고 잠금을 정리한다', async () => {
  const contentRoot = await workspace();
  const filename = await createDiary({ contentRoot, entryId: 'daily', title: '일상', entryDate: '2026-10-22' });
  const original = await readFile(filename, 'utf8');
  await expect(publishDiary({ contentRoot, entryId: 'daily', publishedAt: '2026-10-22' })).rejects.toThrow(
    'publishedAt',
  );
  expect(await readFile(filename, 'utf8')).toBe(original);
  await writeFile(filename, `${original}\n![없는 이미지](./missing.png)`);
  const invalid = await readFile(filename, 'utf8');
  await expect(
    publishDiary({ contentRoot, entryId: 'daily', publishedAt: '2026-10-22T15:00:00+09:00' }),
  ).rejects.toThrow('이미지');
  expect(await readFile(filename, 'utf8')).toBe(invalid);
  expect(await readdir(path.dirname(filename))).toEqual(['daily.mdx']);
});

test('중복 생성·경로 이탈과 발행 시각 재설정을 거부한다', async () => {
  const contentRoot = await workspace();
  const options = { contentRoot, entryId: 'daily', title: '일상', entryDate: '2026-10-22' };
  const filename = await createDiary(options);
  await expect(createDiary(options)).rejects.toThrow();
  await expect(createDiary({ ...options, entryDate: '2025-10-22' })).rejects.toThrow('이미 존재하는 일기 ID');
  await expect(createDiary({ ...options, entryDate: '2027-10-22', local: true })).rejects.toThrow(
    '이미 존재하는 일기 ID',
  );
  await expect(createDiary({ ...options, entryId: '../outside' })).rejects.toThrow('ID');
  await publishDiary({ contentRoot, entryId: 'daily', publishedAt: '2026-10-22T15:00:00+09:00' });
  const original = await readFile(filename, 'utf8');
  await expect(
    publishDiary({ contentRoot, entryId: 'daily', publishedAt: '2026-10-23T15:00:00+09:00' }),
  ).rejects.toThrow('최초 publishedAt');
  expect(await readFile(filename, 'utf8')).toBe(original);
  expect(await readdir(path.join(contentRoot, 'diary'))).toEqual(['2026']);
});

test('같은 연도의 여러 일기를 독립적으로 만들고 발행한다', async () => {
  const contentRoot = await workspace();
  const options = { contentRoot, title: '일상', entryDate: '2026-10-22' };
  const first = await createDiary({ ...options, entryId: 'morning' });
  const second = await createDiary({ ...options, entryId: 'evening' });
  await Promise.all([
    publishDiary({ contentRoot, entryId: 'morning', publishedAt: '2026-10-22T09:00:00+09:00' }),
    publishDiary({ contentRoot, entryId: 'evening', publishedAt: '2026-10-22T21:00:00+09:00' }),
  ]);
  expect(path.dirname(first)).toBe(path.dirname(second));
  expect(new Set(await readdir(path.dirname(first)))).toEqual(new Set(['morning.mdx', 'evening.mdx']));
  expect(new Set((await loadDiary(contentRoot)).map(({ entry }) => entry.id))).toEqual(new Set(['morning', 'evening']));
});

test('여러 연도에 같은 ID를 동시에 생성해도 원고는 하나만 생긴다', async () => {
  const contentRoot = await workspace();
  const options = { contentRoot, entryId: 'daily', title: '일상' };
  const results = await Promise.allSettled([
    createDiary({ ...options, entryDate: '2025-10-22' }),
    createDiary({ ...options, entryDate: '2026-10-22' }),
  ]);
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect(await loadDiary(contentRoot, { includeDrafts: true })).toHaveLength(1);
  expect(await readdir(path.join(contentRoot, 'diary'))).toHaveLength(1);
});

test('연도 폴더가 외부 경로를 가리키면 새 원고를 만들지 않는다', async () => {
  const contentRoot = await workspace();
  const outside = await workspace();
  await createDiary({ contentRoot, entryId: 'existing', title: '일상', entryDate: '2026-10-22' });
  await symlink(outside, path.join(contentRoot, 'diary', '2025'));
  await expect(createDiary({ contentRoot, entryId: 'daily', title: '일상', entryDate: '2025-10-22' })).rejects.toThrow(
    '폴더 밖',
  );
  expect(await readdir(outside)).toEqual([]);
});

test.each(['./private.local.png', '../outside.png'])(
  '공개 일기의 비공개·외부 폴더 이미지 참조를 거부한다: %s',
  async (image) => {
    const contentRoot = await workspace();
    const filename = await createDiary({ contentRoot, entryId: 'daily', title: '일상', entryDate: '2026-10-22' });
    await writeFile(filename, `${await readFile(filename, 'utf8')}\n![사진](${image})`);
    await expect(
      publishDiary({ contentRoot, entryId: 'daily', publishedAt: '2026-10-22T15:00:00+09:00' }),
    ).rejects.toThrow('일기 이미지');
    expect(await loadDiary(contentRoot)).toEqual([]);
  },
);
