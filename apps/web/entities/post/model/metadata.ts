import { isRecord, isZonedDateTime } from '../../../shared/lib/validation/index.ts';
import type { PostMetadata } from './post.ts';

export function parsePostMetadataFields(
  data: Record<string, unknown>,
  filename: string,
  isDraft = false,
): PostMetadata {
  function fail(message: string): never {
    throw new Error(`${filename}: ${message}`);
  }
  if (typeof data.title !== 'string' || !data.title.trim()) return fail('title은 빈 문자열일 수 없습니다.');
  if (!(isDraft && (data.publishedAt === undefined || data.publishedAt === '')) && !isZonedDateTime(data.publishedAt))
    return fail('publishedAt에 시간대가 포함된 발행 시각을 작성하세요.');
  if (data.summary !== undefined && typeof data.summary !== 'string') return fail('summary는 문자열이어야 합니다.');
  if (data.tags !== undefined && (!Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === 'string')))
    return fail('tags는 문자열 배열이어야 합니다.');
  if (data.reason !== undefined && typeof data.reason !== 'string') return fail('reason은 문자열이어야 합니다.');
  if (
    data.series !== undefined &&
    (!isRecord(data.series) ||
      typeof data.series.id !== 'string' ||
      !data.series.id.trim() ||
      typeof data.series.order !== 'number' ||
      !Number.isSafeInteger(data.series.order) ||
      data.series.order < 1)
  )
    return fail('series에는 id와 1 이상의 정수 order가 필요합니다.');
  return {
    title: data.title,
    summary: (data.summary as string | undefined) ?? '',
    publishedAt: (data.publishedAt as string | undefined) ?? '',
    tags: (data.tags as string[] | undefined) ?? [],
    ...(data.reason === undefined ? {} : { reason: data.reason as string }),
    ...(data.series === undefined ? {} : { series: data.series as PostMetadata['series'] }),
  };
}
