import { recentSeriesPosts, seriesTitle } from '../../../entities/series';
import type { Series } from '../../../entities/series';

export interface SeriesOverviewItem {
  id: string;
  title: string;
  description: string;
  postCount: number;
  updatedAt: string | null;
  thumbnail?: Series['thumbnail'];
  latestPosts: { id: string; title: string; publishedAt: string }[];
}

export function getSeriesOverview(series: readonly Series[]): SeriesOverviewItem[] {
  return series.map((item) => ({
    id: item.id,
    title: seriesTitle(item),
    description: item.description,
    postCount: item.postCount,
    updatedAt: item.updatedAt,
    thumbnail: item.thumbnail,
    latestPosts: recentSeriesPosts(item).map((post) => ({
      id: post.id,
      title: post.title,
      publishedAt: post.createdAt,
    })),
  }));
}
