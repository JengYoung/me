import type { MetadataRoute } from 'next';
import { posts } from '../screens/posts';
import { postPath } from '../entities/post';
import { diary } from '../screens/diary';
import { diaryPath } from '../entities/diary';
import { absoluteUrl } from '../shared/lib/seo';
import { series, seriesPath } from '../entities/series';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl('/series') },
    ...series
      .filter((item) => !item.hasDrafts)
      .map((item) => ({
        url: absoluteUrl(seriesPath(item.id)),
        ...(item.updatedAt ? { lastModified: item.updatedAt } : {}),
      })),
    ...posts
      .filter((post) => !post.isDraft)
      .map((post) => ({ url: absoluteUrl(postPath(post.id)), lastModified: post.publishedAt })),
    ...diary.filter((entry) => !entry.isDraft).map((entry) => ({ url: absoluteUrl(diaryPath(entry.id)) })),
  ];
}
