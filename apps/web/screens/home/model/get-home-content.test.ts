import { describe, expect, it, vi } from 'vitest';
import type { Post } from '../../../entities/post';
import type { Series } from '../../../entities/series';
import { getHomeContent } from './get-home-content';

// 실제 카탈로그는 Next.js가 생성한다. 선정 테스트의 입력은 각 테스트가 소유한다.
vi.mock('@series-content/catalog.generated', () => ({ series: [] }));

function post(id: string, createdAt: string, overrides: Partial<Post> = {}): Post {
  return {
    id,
    createdAt,
    publishedAt: createdAt,
    title: id,
    summary: '요약',
    tags: [],
    version: '1.0.0',
    ...overrides,
  };
}

function collection(id: string, updatedAt: string | null, overrides: Partial<Series> = {}): Series {
  return { id, updatedAt, title: id, description: '소개', posts: [], postCount: 1, ...overrides };
}

describe('홈 콘텐츠 선정', () => {
  it('최초 발행일로 최근 글 세 편을 고르고 기존 글의 수정일이나 입력 순서는 영향을 주지 않는다', () => {
    const input = [
      post('old', '2026-01-01T00:00:00Z', { publishedAt: '2026-10-01T00:00:00Z' }),
      post('b', '2026-03-01T00:00:00Z'),
      post('a', '2026-03-01T00:00:00Z'),
      post('latest', '2026-04-01T00:00:00Z'),
    ];
    const original = structuredClone(input);
    const result = getHomeContent(input, []);
    expect(result.posts.map((item) => item.id)).toEqual(['latest', 'a', 'b']);
    expect(result.posts[0]?.dateTime).toBe('2026-04-01T00:00:00Z');
    expect(input).toEqual(original);
  });

  it('시리즈는 최근 수정순으로 고르고 표시명·대표 이미지·챕터 수를 보존한다', () => {
    const thumbnail = { src: '/series-cover.png', width: 800, height: 600 };
    const input = [
      collection('z', '2026-02-01T00:00:00Z'),
      collection('a', '2026-02-01T00:00:00Z'),
      collection('blog', '2026-04-01T00:00:00Z', { label: '블로그 개발기', thumbnail, postCount: 8 }),
      collection('old', '2026-01-01T00:00:00Z'),
    ];
    const original = structuredClone(input);
    const result = getHomeContent([], input);
    expect(result.series.map((item) => item.id)).toEqual(['blog', 'a', 'z']);
    expect(result.series[0]).toMatchObject({ title: '블로그 개발기', thumbnail, postCount: 8, href: '/series/blog' });
    expect(input).toEqual(original);
  });

  it('카탈로그의 초안 상태를 유지하고 날짜를 만들어내지 않는다', () => {
    const result = getHomeContent(
      [post('b', '', { isDraft: true }), post('a', '', { isDraft: true })],
      [collection('draft', null, { title: '', hasDrafts: true })],
    );
    expect(result.posts.map((item) => item.id)).toEqual(['a', 'b']);
    expect(result.posts.every((item) => item.dateTime === null && item.isDraft)).toBe(true);
    expect(result.series[0]).toMatchObject({ title: 'draft', dateTime: null, isDraft: true });
  });

  it('최근 세 편 밖의 구성원도 시리즈 태그에 포함하며 중복 태그와 본문은 전달하지 않는다', () => {
    const article = post('한글 글', '2026-04-01T00:00:00Z', {
      series: { id: 'blog', order: 10 },
      tags: ['React', 'MDX'],
    });
    const content = { ...article, body: '비용이 큰 본문', revisions: ['과거 본문'] };
    const result = getHomeContent(
      [
        content,
        post('next', '2026-02-01T00:00:00Z', { series: { id: 'blog', order: 20 }, tags: ['MDX'] }),
        post('third', '2026-03-01T00:00:00Z'),
        post('old', '2026-01-01T00:00:00Z', { series: { id: 'blog', order: 5 }, tags: ['이전 환경'] }),
      ],
      [collection('blog', '2026-02-01T00:00:00Z', { label: '블로그 개발기' })],
    );
    expect(result.series[0]?.tags).toEqual(['React', 'MDX', '이전 환경']);
    expect(result.posts.map((item) => item.id)).not.toContain('old');
    expect(result.posts[0]).toMatchObject({
      seriesTitle: '블로그 개발기',
      href: `/posts/${encodeURIComponent('한글 글')}`,
    });
    expect(result.posts[0]).not.toHaveProperty('body');
    expect(result.posts[0]).not.toHaveProperty('revisions');
  });

  it('빈 카탈로그에 임의의 글이나 시리즈를 만들지 않는다', () => {
    expect(getHomeContent([], [])).toEqual({ posts: [], series: [] });
  });
});
