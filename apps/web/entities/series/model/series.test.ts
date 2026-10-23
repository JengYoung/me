import { expect, test } from 'vitest';
import { collectSeries, recentSeriesPosts, seriesPath, seriesTitle } from './series';
import type { SeriesPost } from './series';

test('시리즈는 최근 수정순, 캐러셀 최근 글은 최초 발행순, 챕터는 order순으로 각각 정렬한다', () => {
  const definitions = ['a', 'b'].map((id) => ({ id, label: `시리즈 ${id}`, title: id, description: id }));
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
  expect(series.map((item) => item.label)).toEqual(['시리즈 a', '시리즈 b']);
  expect(series[0]!.posts.map((post) => post.id)).toEqual(['first', 'second']);
  expect(recentSeriesPosts(series[0]!).map((post) => post.id)).toEqual(['second', 'first']);
  expect(posts.map((post) => post.id)).toEqual(['second', 'first', 'other']);
});

test.each([
  { label: ' 블로그 개발기 ', title: '기존 제목', expected: '블로그 개발기' },
  { label: undefined, title: '기존 제목', expected: '기존 제목' },
  { label: '', title: '기존 제목', expected: '기존 제목' },
  { label: '  ', title: ' ', expected: 'building-my-blog' },
])('표시 이름은 label → title → ID 순서로 선택하고 URL은 ID를 유지한다: $expected', ({ label, title, expected }) => {
  const definition = { id: 'building-my-blog', label, title };
  expect(seriesTitle(definition)).toBe(expected);
  expect(seriesPath(definition.id)).toBe('/series/building-my-blog');
});
