import { isZonedDateTime } from '../../../shared/lib/validation/index.ts';
import { entryDateError } from './diary.ts';
import type { DiaryEntry } from './diary.ts';

export function parseDiaryMetadataFields(
  data: Record<string, unknown>,
  filename: string,
): Omit<DiaryEntry, 'id' | 'isDraft'> {
  function fail(message: string): never {
    throw new Error(`${filename}: ${message}`);
  }
  for (const key of ['series', 'version', 'revisions', 'history', 'reason', 'status']) {
    if (key in data) return fail(`diary는 시리즈·히스토리를 지원하지 않습니다 (${key}).`);
  }
  if (typeof data.title !== 'string' || !data.title.trim()) return fail('title은 빈 문자열일 수 없습니다.');
  if (data.publishedAt !== undefined && data.publishedAt !== '' && !isZonedDateTime(data.publishedAt))
    return fail('publishedAt에 시간대가 포함된 발행 시각을 작성하세요.');
  if (data.summary !== undefined && typeof data.summary !== 'string') return fail('summary는 문자열이어야 합니다.');
  if (data.tags !== undefined && (!Array.isArray(data.tags) || !data.tags.every((tag) => typeof tag === 'string')))
    return fail('tags는 문자열 배열이어야 합니다.');
  const error = typeof data.entryDate === 'string' ? entryDateError(data.entryDate) : 'entryDate가 필요합니다.';
  if (error) return fail(error);
  return {
    title: data.title,
    summary: (data.summary as string | undefined) ?? '',
    publishedAt: (data.publishedAt as string | undefined) ?? '',
    tags: (data.tags as string[] | undefined) ?? [],
    entryDate: data.entryDate as string,
  };
}
