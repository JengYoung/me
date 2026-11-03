import { DiaryPage } from '../../screens/diary';
import { parsePageNumber } from '../../shared/lib/pagination';
import { pageMetadata } from '../../shared/lib/seo';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = parsePageNumber((await searchParams).page);
  return pageMetadata({ title: `Diary — ${page}페이지`, description: '재영의 일기록', pathname: '/diary' });
}
export default DiaryPage;
