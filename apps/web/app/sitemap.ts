import type { MetadataRoute } from 'next';
import { posts } from '../screens/posts';
import { postPath } from '../entities/post';
import { diary } from '../screens/diary';
import { diaryPath } from '../entities/diary';
import { absoluteUrl } from '../shared/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...posts
      .filter((post) => !post.isDraft)
      .map((post) => ({ url: absoluteUrl(postPath(post.id)), lastModified: post.publishedAt })),
    ...diary.filter((entry) => !entry.isDraft).map((entry) => ({ url: absoluteUrl(diaryPath(entry.id)) })),
  ];
}
