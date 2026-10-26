import { parse } from 'yaml';

export interface ArticleMetadata {
  title: string;
  summary: string;
  publishedAt: string;
  tags: string[];
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseFrontmatter(source: string, filename: string): Record<string, unknown> {
  const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) throw new Error(`${filename}: frontmatter가 필요합니다.`);
  let data: unknown;
  try {
    data = parse(match[1]!);
  } catch (error) {
    throw new Error(`${filename}: ${error instanceof Error ? error.message : 'frontmatter를 읽을 수 없습니다.'}`);
  }
  if (!isRecord(data)) throw new Error(`${filename}: frontmatter는 객체여야 합니다.`);
  return data;
}

export function parseArticleMetadata(
  data: Record<string, unknown>,
  filename: string,
  allowUnpublished = false,
): ArticleMetadata {
  function fail(message: string): never {
    throw new Error(`${filename}: ${message}`);
  }
  if (typeof data.title !== 'string' || !data.title.trim()) return fail('title은 빈 문자열일 수 없습니다.');
  if (
    !(allowUnpublished && (data.publishedAt === undefined || data.publishedAt === '')) &&
    (typeof data.publishedAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(data.publishedAt) ||
      !Number.isFinite(Date.parse(data.publishedAt)))
  )
    return fail('publishedAt에 시간대가 포함된 발행 시각을 작성하세요.');
  if (data.summary !== undefined && typeof data.summary !== 'string') return fail('summary는 문자열이어야 합니다.');
  if (data.tags !== undefined && (!Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === 'string')))
    return fail('tags는 문자열 배열이어야 합니다.');
  return {
    title: data.title,
    summary: (data.summary as string | undefined) ?? '',
    publishedAt: (data.publishedAt as string | undefined) ?? '',
    tags: (data.tags as string[] | undefined) ?? [],
  };
}
