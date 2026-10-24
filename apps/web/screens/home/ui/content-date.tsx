import type { HomeContentItem } from '../model/get-home-content';

export function ContentDate({ item }: { item: Pick<HomeContentItem, 'dateTime' | 'isDraft'> }) {
  if (!item.dateTime) return <span>{item.isDraft ? '작성 중' : '날짜 미지정'}</span>;
  return (
    <time dateTime={item.dateTime}>
      {new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeZone: 'Asia/Seoul' }).format(
        new Date(item.dateTime),
      )}
    </time>
  );
}
