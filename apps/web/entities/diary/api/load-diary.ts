import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArticleMetadata, parseFrontmatter } from '../../../shared/content/index.ts';
import { entryDateError } from '../model/diary.ts';
import type { DiaryEntry } from '../model/diary.ts';

export interface DiaryDocument {
  entry: DiaryEntry;
  sourcePath: string;
}

export function parseDiaryMetadata(source: string, filename: string): Omit<DiaryEntry, 'id'> {
  const data = parseFrontmatter(source, filename);
  for (const key of ['series', 'version', 'revisions', 'history', 'reason', 'status']) {
    if (key in data) throw new Error(`${filename}: diary는 시리즈·히스토리를 지원하지 않습니다 (${key}).`);
  }
  const metadata = parseArticleMetadata(data, filename, true);
  const error = typeof data.entryDate === 'string' ? entryDateError(data.entryDate) : 'entryDate가 필요합니다.';
  if (error) throw new Error(`${filename}: ${error}`);
  const entryDate = data.entryDate as string;
  if (path.basename(path.dirname(filename)) !== entryDate.slice(0, 4))
    throw new Error(`${filename}: 연도 폴더는 entryDate의 연도와 같아야 합니다.`);
  return {
    ...metadata,
    entryDate,
    ...(!metadata.publishedAt || filename.endsWith('.local.mdx') ? { isDraft: true as const } : {}),
  };
}

/** 연도 폴더 안의 독립된 단일 원고들을 읽는다. ID는 전체 연도에서 고유하다. */
export async function loadDiary(contentRoot: string, { includeDrafts = false } = {}): Promise<DiaryDocument[]> {
  const root = path.join(contentRoot, 'diary');
  const directories = await readdir(root, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  if (directories.some((item) => item.isFile() && item.name.endsWith('.mdx')))
    throw new Error('일기 원고는 diary/{year}/{entryId}.mdx로 관리하세요.');
  const sources = (
    await Promise.all(
      directories
        .filter((item) => item.isDirectory())
        .map(async (directory) => {
          const files = await readdir(path.join(root, directory.name), { withFileTypes: true });
          if (files.some((file) => /^\d+\.\d+\.\d+(?:\.local)?\.mdx?$/.test(file.name)))
            throw new Error(`diary/${directory.name}: 버전 파일 대신 {entryId}.mdx 하나를 사용하세요.`);
          return files
            .filter((file) => file.isFile() && file.name.endsWith('.mdx'))
            .map((file) => {
              if (!/^\d{4}$/.test(directory.name))
                throw new Error(`diary/${directory.name}: 일기는 네 자리 연도 폴더에 저장하세요.`);
              const match = /^([a-z0-9]+(?:-[a-z0-9]+)*)(?:\.local)?\.mdx$/.exec(file.name);
              if (!match) throw new Error(`diary/${directory.name}/${file.name}: 유효한 entryId가 필요합니다.`);
              return { id: match[1]!, sourcePath: path.join(root, directory.name, file.name) };
            });
        }),
    )
  ).flat();
  const ids = new Set<string>();
  for (const { id } of sources) {
    if (ids.has(id)) throw new Error(`diary: "${id}" ID의 원고는 모든 연도에서 하나만 둘 수 있습니다.`);
    ids.add(id);
  }
  const documents = await Promise.all(
    sources.map(async ({ id, sourcePath }) => {
      if (!includeDrafts && sourcePath.endsWith('.local.mdx')) return undefined;
      const entry = { ...parseDiaryMetadata(await readFile(sourcePath, 'utf8'), sourcePath), id };
      if (entry.isDraft && !includeDrafts) return undefined;
      return { entry, sourcePath };
    }),
  );
  const entries = documents.filter((item): item is DiaryDocument => item !== undefined);
  // oxlint-disable-next-line unicorn/no-array-sort -- filter로 만든 지역 배열만 정렬한다.
  return entries.sort(
    (a, b) => b.entry.entryDate.localeCompare(a.entry.entryDate) || a.entry.id.localeCompare(b.entry.id),
  );
}
