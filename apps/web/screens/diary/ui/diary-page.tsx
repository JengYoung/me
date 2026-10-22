import { diaryPath, formatEntryDate } from '../../../entities/diary';
import { ArticleList } from '../../../shared/article';
import { diary } from '@diary-content/catalog.generated';

export function DiaryPage() {
  return (
    <ArticleList
      typography="serif"
      title="일기"
      emptyMessage="아직 공개된 일기가 없습니다."
      items={diary.map((entry) => ({
        id: entry.id,
        href: diaryPath(entry.id),
        title: entry.title,
        summary: entry.summary,
        dateTime: entry.entryDate,
        dateLabel: formatEntryDate(entry.entryDate),
        isDraft: entry.isDraft,
      }))}
    />
  );
}
