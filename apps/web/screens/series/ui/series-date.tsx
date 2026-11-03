export function SeriesDate({ dateTime, className }: { dateTime: string | null; className?: string }) {
  if (!dateTime) return <span className={className}>미발행</span>;
  return (
    <time dateTime={dateTime} className={className}>
      {new Intl.DateTimeFormat('ko-KR', {
        dateStyle: 'medium',
        timeZone: 'Asia/Seoul',
      }).format(new Date(dateTime))}
    </time>
  );
}
