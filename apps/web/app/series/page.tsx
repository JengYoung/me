import { SeriesPage } from '../../screens/series';
import { parsePageNumber } from '../../shared/lib/pagination';
import { pageMetadata } from '../../shared/lib/seo';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = parsePageNumber((await searchParams).page);
  return pageMetadata({
    title: `Series — ${page}페이지`,
    description: '하나의 주제를 순서대로 읽는 글 모음입니다.',
    pathname: '/series',
  });
}
export default async function Page({ searchParams }: { searchParams: Promise<{ showType?: string | string[] }> }) {
  const { showType } = await searchParams;
  return <SeriesPage showType={showType === 'carousel' ? 'carousel' : 'list'} />;
}
