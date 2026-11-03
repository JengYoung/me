import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react/pure';
import type { SeriesOverviewItem } from '../model/get-series-overview';
import { SeriesCarousel } from './series-carousel';

function seriesItem(id: string): SeriesOverviewItem {
  return {
    id,
    title: `${id} 시리즈 제목`,
    description: '시리즈를 읽으며 문제를 해결한 과정과 판단의 이유를 살펴봅니다. '.repeat(12),
    postCount: 3,
    updatedAt: '2026-10-23T00:00:00Z',
    latestPosts: [1, 2, 3].map((number) => ({
      id: `${id}-${number}`,
      title: `${id}의 최근 글 ${number}`,
      publishedAt: '2026-10-22T00:00:00Z',
    })),
  };
}

test('빈 시리즈는 안내를, 단일 시리즈는 방향 조작 없이 제목과 상세 링크를 제공한다', async () => {
  const screen = await render(<SeriesCarousel items={[]} />);
  await expect.element(screen.getByText('아직 시리즈가 없습니다.')).toBeVisible();
  await expect.element(screen.getByRole('button', { name: '다음 시리즈' })).not.toBeInTheDocument();
  await screen.rerender(<SeriesCarousel items={[{ ...seriesItem('only'), description: '한 편씩 읽는 시리즈' }]} />);
  await expect.element(screen.getByRole('heading', { name: 'only 시리즈 제목' })).toBeVisible();
  await expect
    .element(screen.getByRole('link', { name: 'only 시리즈 제목', exact: true }))
    .toHaveAttribute('href', '/series/only');
  await expect.element(screen.getByRole('button', { name: '이전 시리즈' })).not.toBeInTheDocument();
  await expect.element(screen.getByRole('button', { name: '다음 시리즈' })).not.toBeInTheDocument();
});

test('모바일의 긴 설명은 펼치고 접을 수 있고 숨겨진 최근 글은 탐색에서 제외된다', async () => {
  const screen = await render(<SeriesCarousel items={[seriesItem('long')]} />);
  const recent = screen.getByRole('list', { name: 'long 시리즈 제목의 최근 글' });
  if (window.matchMedia('(min-width: 1200px)').matches) {
    await expect.element(recent).toBeVisible();
    await expect.element(screen.getByRole('button', { name: '내용 펼치기' })).not.toBeInTheDocument();
    return;
  }
  const expand = screen.getByRole('button', { name: '내용 펼치기' });
  await expect.element(expand).toBeVisible();
  await expect.element(recent).not.toBeInTheDocument();
  await expand.click();
  await expect.element(recent).toBeVisible();
  await expect.element(screen.getByRole('link', { name: /long의 최근 글 1/ })).toBeVisible();
  await screen.getByRole('button', { name: '접기' }).click();
  await expect.element(recent).not.toBeInTheDocument();
  await expect.element(expand).toHaveAttribute('aria-expanded', 'false');
});

test('순환 전환은 현재 시리즈만 노출하며 동작 줄이기 설정에서 애니메이션을 생략한다', async () => {
  const screen = await render(<SeriesCarousel items={[seriesItem('first'), seriesItem('second')]} />);
  const firstCover = screen.getByRole('link', { name: 'first 시리즈 제목 시리즈 썸네일' }).element();
  const expression = firstCover.querySelector('svg')!.getAttribute('data-expression');
  const next = screen.getByRole('button', { name: '다음 시리즈' });
  await next.click();
  await expect.element(screen.getByRole('heading', { name: 'second 시리즈 제목' })).toBeVisible();
  await expect.element(screen.getByRole('heading', { name: 'first 시리즈 제목' })).not.toBeInTheDocument();
  expect(firstCover.closest<HTMLElement>('[data-part="slide"]')!.inert).toBe(true);
  expect(firstCover.querySelector('svg')!.getAttribute('data-expression')).toBe(expression);
  await expect.element(screen.getByRole('status')).toHaveTextContent('2개 중 2번째 시리즈, second 시리즈 제목');
  await next.click();
  await expect.element(screen.getByRole('heading', { name: 'first 시리즈 제목' })).toBeVisible();
  expect(firstCover.querySelector('svg')!.getAttribute('data-expression')).toBe(expression);
  expect(firstCover.closest('[data-part="slide"]')!.getAnimations({ subtree: true })).toHaveLength(0);
});
