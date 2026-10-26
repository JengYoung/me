import { SeriesPage } from '../../screens/series';
import { pageMetadata } from '../../shared/seo';

export const metadata = pageMetadata({
  title: '시리즈',
  description: '하나의 주제를 순서대로 읽는 글 모음입니다.',
  pathname: '/series',
});
export default async function Page({ searchParams }: { searchParams: Promise<{ showType?: string | string[] }> }) {
  const { showType } = await searchParams;
  return <SeriesPage showType={showType === 'carousel' ? 'carousel' : 'list'} />;
}
