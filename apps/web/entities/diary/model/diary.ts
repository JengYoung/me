export interface DiaryEntry {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  /** 한국 시간의 기록 대상 날짜. 발행 시각과 별개다. */
  entryDate: string;
  publishedAt: string;
  isDraft?: true;
}

export function diaryPath(entryId: string) {
  return `/diary/${encodeURIComponent(entryId)}`;
}

export function entryDateError(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? undefined
    : 'entryDate는 실제 날짜를 YYYY-MM-DD로 입력하세요.';
}

export function formatEntryDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long', timeZone: 'Asia/Seoul' }).format(
    new Date(`${value}T00:00:00+09:00`),
  );
}
