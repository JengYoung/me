import { SeriesDetailPage, getSeriesMetadata, getSeriesStaticParams } from '../../../screens/series';

export const dynamic = 'force-static';
export const generateStaticParams = getSeriesStaticParams;
export async function generateMetadata({ params }: { params: Promise<{ seriesId: string }> }) {
  return getSeriesMetadata((await params).seriesId);
}
export default async function Page({ params }: { params: Promise<{ seriesId: string }> }) {
  return <SeriesDetailPage seriesId={(await params).seriesId} />;
}
