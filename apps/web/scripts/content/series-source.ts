import { mkdir, readFile, realpath, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { loadPosts } from '../../entities/post/api/load-posts.ts';
import { collectSeries } from '../../entities/series/model/series.ts';
import type { SeriesDefinition, SeriesRecord } from '../../entities/series/model/series.ts';
import { isRecord } from '../../shared/content/index.ts';

export function parseSeriesRegistry(source: string, filename: string): SeriesDefinition[] {
  let data: unknown;
  try {
    data = JSON.parse(source);
  } catch (error) {
    throw new Error(`${filename}: 시리즈 JSON 문법을 확인하세요.`, { cause: error });
  }
  if (!Array.isArray(data)) throw new Error(`${filename}: 시리즈 JSON은 배열이어야 합니다.`);
  const ids = new Set<string>();
  return data.map((item: unknown) => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) ||
      typeof item.title !== 'string' ||
      typeof item.description !== 'string' ||
      (item.thumbnail !== undefined && typeof item.thumbnail !== 'string')
    ) {
      throw new Error(`${filename}: id·title·description 문자열과 선택 thumbnail 경로를 확인하세요.`);
    }
    if (Object.keys(item).some((key) => !['id', 'title', 'description', 'thumbnail', 'derived'].includes(key))) {
      throw new Error(`${filename}: 시리즈 ${item.id}에 알 수 없는 필드가 있습니다.`);
    }
    if (ids.has(item.id)) throw new Error(`${filename}: 중복 시리즈 ID ${item.id}`);
    ids.add(item.id);
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      ...(item.thumbnail === undefined ? {} : { thumbnail: item.thumbnail as string }),
    };
  });
}

export function validateSeriesText(
  definitions: readonly Pick<SeriesDefinition, 'id' | 'title' | 'description'>[],
  filename: string,
) {
  const errors = definitions.flatMap((item) =>
    ['title', 'description']
      .filter((key) => !item[key as 'title' | 'description'].trim())
      .map((key) => `${item.id}.${key}`),
  );
  if (errors.length) throw new Error(`${filename}: 빈 시리즈 필드를 입력하세요: ${errors.join(', ')}`);
}

export async function seriesImagePath(contentRoot: string, item: SeriesDefinition, preview: boolean) {
  if (!item.thumbnail) return undefined;
  const relative = item.thumbnail;
  if (
    path.isAbsolute(relative) ||
    relative.includes('\\') ||
    relative.split('/').includes('..') ||
    !/\.(png|jpe?g|webp|avif|gif)$/i.test(relative) ||
    /[?#]/.test(relative) ||
    (!preview && relative.includes('.local.'))
  ) {
    throw new Error(`시리즈 ${item.id}: docs/series 안의 공개 이미지 상대 경로를 사용하세요: ${relative}`);
  }
  const root = await realpath(path.join(contentRoot, 'series'));
  const target = await realpath(path.resolve(root, relative)).catch(() => {
    throw new Error(`시리즈 ${item.id}: 대표 이미지가 없습니다: ${relative}`);
  });
  if (!target.startsWith(`${root}${path.sep}`))
    throw new Error(`시리즈 ${item.id}: 이미지가 docs/series 밖에 있습니다.`);
  if (!(await stat(target)).isFile()) throw new Error(`시리즈 ${item.id}: 대표 이미지 파일이 아닙니다: ${relative}`);
  return target;
}

/** 수동 입력은 보존한다. Git 관리 파생 정보에는 공개 글만, 개발 화면에는 현재 초안도 포함한다. */
export async function synchronizeSeries(contentRoot: string, includeDrafts = false) {
  const filename = path.join(contentRoot, 'series/series.json');
  const source = await readFile(filename, 'utf8').catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  const definitions = parseSeriesRegistry(source ?? '[]', filename);
  const [published, preview] = await Promise.all([
    loadPosts(contentRoot),
    includeDrafts ? loadPosts(contentRoot, { includeDrafts: true }) : Promise.resolve(undefined),
  ]);
  const current = preview ?? published;
  const ids = new Set(definitions.map((item) => item.id));
  for (const { latest } of [...published, ...current]) {
    const id = latest.post.series?.id;
    if (!id || ids.has(id)) continue;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))
      throw new Error(`시리즈 ID는 소문자 영문·숫자·하이픈으로 작성하세요: ${id}`);
    definitions.push({ id, title: '', description: '' });
    ids.add(id);
  }
  // oxlint-disable-next-line unicorn/no-array-sort -- JSON 파싱으로 만든 지역 배열이다.
  definitions.sort((a, b) => a.id.localeCompare(b.id, 'en'));
  const publicSeries = collectSeries(
    definitions,
    published.map(({ latest }) => latest.post),
  );
  const publicById = new Map(publicSeries.map((item) => [item.id, item]));
  const records: SeriesRecord[] = definitions.map((item) => {
    const collected = publicById.get(item.id);
    return {
      ...item,
      derived: {
        posts: collected?.posts.map((post) => ({ id: post.id, order: post.series!.order })) ?? [],
        postCount: collected?.postCount ?? 0,
        updatedAt: collected?.updatedAt ?? null,
      },
    };
  });
  const next = `${JSON.stringify(records, null, 2)}\n`;
  if (next !== source) {
    await mkdir(path.dirname(filename), { recursive: true });
    const temporary = `${filename}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, next);
      // 수집 도중 작성자가 수정한 내용을 덮어쓰지 않는다.
      const latestSource = await readFile(filename, 'utf8').catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return null;
        throw error;
      });
      if (latestSource !== source) throw new Error(`${filename}: 수집 중 파일이 변경되었습니다. 다시 실행하세요.`);
      await rename(temporary, filename);
    } finally {
      await unlink(temporary).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
  }
  return {
    filename,
    definitions,
    publicSeries,
    series: includeDrafts
      ? collectSeries(
          definitions,
          current.map(({ latest }) => latest.post),
        )
      : publicSeries,
  };
}

export async function validateSeries(contentRoot: string) {
  const result = await synchronizeSeries(contentRoot);
  validateSeriesText(result.definitions, result.filename);
  await Promise.all(result.definitions.map((item) => seriesImagePath(contentRoot, item, false)));
  return result.series.length;
}
