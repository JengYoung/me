import { link, mkdir, open, readFile, realpath, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { stringify } from 'yaml';
import { loadDiary, parseDiaryMetadata } from '../../entities/diary/api/load-diary.ts';
import { docsRoot, postIdError, updateFrontmatter } from './source.ts';
import { validateDiaryFile } from './validate-diary.ts';

export async function createDiary({
  contentRoot = docsRoot,
  entryId,
  title,
  entryDate,
  summary = '',
  tags = [],
  local = false,
}: {
  contentRoot?: string;
  entryId: string;
  title: string;
  entryDate: string;
  summary?: string;
  tags?: string[];
  local?: boolean;
}) {
  const error = postIdError(entryId);
  if (error) throw new Error(error);
  const root = path.join(contentRoot, 'diary');
  const year = entryDate.slice(0, 4);
  const directory = path.join(root, year);
  const filename = path.join(directory, `${entryId}${local ? '.local' : ''}.mdx`);
  const source = `---\n${stringify({ title, summary, entryDate, publishedAt: '', tags }, { lineWidth: 0 })}---\n\n본문을 작성하세요.\n`;
  parseDiaryMetadata(source, filename);
  await mkdir(root, { recursive: true });
  // 다른 연도에 같은 ID를 동시에 만드는 경우도 중복을 막는다.
  const lockPath = path.join(root, `.${entryId}.create.lock`);
  const lock = await open(lockPath, 'wx');
  try {
    if ((await loadDiary(contentRoot, { includeDrafts: true })).some(({ entry }) => entry.id === entryId))
      throw new Error(`이미 존재하는 일기 ID입니다: ${entryId}`);
    await mkdir(directory, { recursive: true });
    if ((await realpath(directory)) !== path.join(await realpath(root), year))
      throw new Error('연도 폴더가 해당 docs/diary 폴더 밖을 가리킵니다.');
    const file = await open(filename, 'wx');
    try {
      await file.writeFile(source);
    } catch (error) {
      await unlink(filename);
      throw error;
    } finally {
      await file.close();
    }
  } finally {
    try {
      await lock.close();
    } finally {
      await unlink(lockPath);
    }
  }
  return filename;
}

export async function editDiary({ contentRoot = docsRoot, entryId }: { contentRoot?: string; entryId: string }) {
  const error = postIdError(entryId);
  if (error) throw new Error(error);
  const document = (await loadDiary(contentRoot, { includeDrafts: true })).find(({ entry }) => entry.id === entryId);
  if (!document) throw new Error(`수정할 일기가 없습니다: ${entryId}`);
  const root = await realpath(path.join(contentRoot, 'diary'));
  const filename = await realpath(document.sourcePath);
  if (path.dirname(path.dirname(filename)) !== root || !/^\d{4}$/.test(path.basename(path.dirname(filename))))
    throw new Error('일기 원고가 해당 docs/diary 폴더 밖을 가리킵니다.');
  return filename;
}

/** 현재 원고의 발행 시각만 설정한다. 버전·자산 사본·히스토리를 만들지 않는다. */
export async function publishDiary({
  contentRoot = docsRoot,
  entryId,
  publishedAt,
  dryRun = false,
}: {
  contentRoot?: string;
  entryId: string;
  publishedAt?: string;
  dryRun?: boolean;
}) {
  const filename = await editDiary({ contentRoot, entryId });
  const lockPath = path.join(path.dirname(filename), `.${entryId}.publish.lock`);
  const lock = await open(lockPath, 'wx');
  try {
    const source = await readFile(filename, 'utf8');
    const previous = parseDiaryMetadata(source, filename);
    const date = previous.publishedAt || publishedAt;
    if (!date) throw new Error('최초 공개에는 --published-at으로 발행 시각을 지정하세요.');
    if (previous.publishedAt && publishedAt && publishedAt !== previous.publishedAt)
      throw new Error('이미 발행한 일기는 최초 publishedAt을 유지하세요. 본문은 같은 파일에서 직접 수정합니다.');
    const target = path.join(path.dirname(filename), `${entryId}.mdx`);
    const updated = updateFrontmatter(source, { publishedAt: date });
    await validateDiaryFile(target, updated);
    if (!dryRun) {
      // 검증이 끝난 원고를 임시 파일에서 교체한다. 실패하면 원고는 보존한다.
      const temporary = path.join(path.dirname(filename), `.${entryId}.publish.tmp`);
      const file = await open(temporary, 'wx');
      try {
        await file.writeFile(updated);
        if ((await readFile(filename, 'utf8')) !== source)
          throw new Error('검증 중 원고가 변경되었습니다. 다시 실행하세요.');
        if (filename !== target) {
          await link(temporary, target);
          try {
            await unlink(filename);
          } catch (error) {
            await unlink(target);
            throw error;
          }
        } else {
          await rename(temporary, target);
        }
      } finally {
        try {
          await file.close();
        } finally {
          await unlink(temporary).catch((error: NodeJS.ErrnoException) => {
            if (error.code !== 'ENOENT') throw error;
          });
        }
      }
    }
    return { filename: target, publishedAt: date, dryRun };
  } finally {
    try {
      await lock.close();
    } finally {
      await unlink(lockPath);
    }
  }
}
