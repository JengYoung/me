import { postPath, type Post } from '../../../entities/post';
import { seriesPath, seriesTitle, type Series } from '../../../entities/series';

export interface HomeContentItem {
  id: string;
  kind: 'post' | 'series';
  title: string;
  seriesTitle?: string;
  summary: string;
  tags: readonly string[];
  href: string;
  dateTime: string | null;
  thumbnail?: Series['thumbnail'];
  postCount?: number;
  isDraft?: boolean;
}

export interface HomeSeriesItem extends HomeContentItem {
  kind: 'series';
  postCount: number;
}

const timestamp = (value: string | null) => (value ? Date.parse(value) || 0 : 0);

/** 카탈로그의 본문·과거 버전 없이 홈에서 필요한 최근 메타데이터만 전달한다. */
export function getHomeContent(posts: readonly Post[], series: readonly Series[]) {
  const seriesNames = new Map(series.map((item) => [item.id, seriesTitle(item)]));
  const tags = new Map<string, Set<string>>();
  for (const post of posts) {
    if (!post.series) continue;
    const group = tags.get(post.series.id) ?? new Set<string>();
    for (const tag of post.tags) group.add(tag);
    tags.set(post.series.id, group);
  }
  return {
    posts: [...posts]
      // oxlint-disable-next-line unicorn/no-array-sort -- 새 배열만 정렬하며 ES2022 브라우저를 지원한다.
      .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt) || a.id.localeCompare(b.id, 'en'))
      .slice(0, 3)
      .map((post): HomeContentItem => ({
        id: post.id,
        kind: 'post',
        title: post.title,
        seriesTitle: post.series ? seriesNames.get(post.series.id) : undefined,
        summary: post.summary,
        tags: post.tags,
        href: postPath(post.id),
        dateTime: post.createdAt || null,
        isDraft: post.isDraft,
      })),
    series: [...series]
      // oxlint-disable-next-line unicorn/no-array-sort -- 새 배열만 정렬하며 원본 카탈로그는 보존한다.
      .sort((a, b) => timestamp(b.updatedAt) - timestamp(a.updatedAt) || a.id.localeCompare(b.id, 'en'))
      .slice(0, 3)
      .map((item): HomeSeriesItem => ({
        id: item.id,
        kind: 'series',
        title: seriesTitle(item),
        summary: item.description,
        tags: [...(tags.get(item.id) ?? [])],
        href: seriesPath(item.id),
        dateTime: item.updatedAt,
        thumbnail: item.thumbnail,
        postCount: item.postCount,
        isDraft: item.hasDrafts,
      })),
  };
}
