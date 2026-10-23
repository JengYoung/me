import { expect, test } from 'vitest';
import { collectSeries, recentSeriesPosts } from './series';
import type { SeriesPost } from './series';

test('시리즈는 최근 수정순, 캐러셀 최근 글은 최초 발행순, 챕터는 order순으로 각각 정렬한다', () => {
  const definitions = ['a', 'b'].map((id) => ({ id, title: id, description: id }));
  const posts: SeriesPost[] = [
    {
      id: 'second',
      title: '두 번째',
      summary: '',
      createdAt: '2026-10-20T00:00:00Z',
      publishedAt: '2026-10-20T00:00:00Z',
      series: { id: 'a', order: 30 },
    },
    {
      id: 'first',
      title: '첫 번째',
      summary: '',
      createdAt: '2026-10-01T00:00:00Z',
      publishedAt: '2026-10-22T00:00:00Z',
      series: { id: 'a', order: 10 },
    },
    {
      id: 'other',
      title: '다른 시리즈',
      summary: '',
      createdAt: '2026-10-21T00:00:00Z',
      publishedAt: '2026-10-21T00:00:00Z',
      series: { id: 'b', order: 1 },
    },
  ];
  const series = collectSeries(definitions, posts);
  expect(series.map((item) => item.id)).toEqual(['a', 'b']);
  expect(series[0]!.posts.map((post) => post.id)).toEqual(['first', 'second']);
  expect(recentSeriesPosts(series[0]!).map((post) => post.id)).toEqual(['second', 'first']);
  expect(posts.map((post) => post.id)).toEqual(['second', 'first', 'other']);
});
