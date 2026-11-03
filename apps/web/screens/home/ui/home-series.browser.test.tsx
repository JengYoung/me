import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react/pure';
import type { HomeSeriesItem } from '../model/get-home-content';
import { HomeSeries } from './home-series';

test('시리즈 선택에 따라 큰 썸네일·제목·설명·글 수를 함께 바꾸고 최근 글 목록은 표시하지 않는다', async () => {
  const items: HomeSeriesItem[] = [
    {
      id: 'blog',
      kind: 'series',
      title: '블로그 개발기',
      summary: '블로그를 직접 설계하며 내린 결정을 기록합니다.',
      tags: [],
      href: '/series/blog',
      dateTime: null,
      postCount: 13,
      thumbnail: { src: '/series-cover.svg', width: 800, height: 600 },
    },
    {
      id: 'mdx',
      kind: 'series',
      title: 'mdx',
      summary: '',
      tags: [],
      href: '/series/mdx',
      dateTime: null,
      isDraft: true,
      postCount: 5,
    },
  ];
  const screen = await render(<HomeSeries items={items} />);
  const first = screen.getByRole('group', { name: '블로그 개발기', exact: true });
  await expect.element(first.getByRole('heading', { name: '블로그 개발기', exact: true })).toBeVisible();
  await expect.element(first.getByText('블로그를 직접 설계하며 내린 결정을 기록합니다.')).toBeVisible();
  await expect.element(first.getByText('13개의 글', { exact: true })).toBeVisible();
  await expect.element(screen.getByRole('heading', { name: '최근 글', exact: true })).not.toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: '블로그 개발기 시리즈 보기' }).element().querySelector('img')?.getAttribute('src'),
  ).toBe('/series-cover.svg');
  const next = screen.getByRole('button', { name: '다음 시리즈', exact: true });
  await expect.element(screen.getByRole('button', { name: '이전 시리즈', exact: true })).toBeEnabled();
  await next.click();
  await expect.element(screen.getByRole('heading', { name: '블로그 개발기', exact: true })).not.toBeInTheDocument();
  const second = screen.getByRole('group', { name: 'mdx', exact: true });
  await expect.element(second.getByRole('heading', { name: 'mdx', exact: true })).toBeVisible();
  await expect.element(second.getByText('시리즈 소개를 준비하고 있어요.')).toBeVisible();
  await expect.element(second.getByText('5개의 글', { exact: true })).toBeVisible();
  await expect.element(second.getByRole('link', { name: 'mdx', exact: true })).toHaveAttribute('href', '/series/mdx');
  expect(
    screen.getByRole('link', { name: 'mdx 시리즈 보기' }).element().querySelector('img')?.getAttribute('src'),
  ).toBe('/characters/character/10-curious.svg');
  await expect
    .element(screen.getByRole('button', { name: 'mdx 선택', exact: true }))
    .toHaveAttribute('aria-pressed', 'true');
  await expect.element(screen.getByRole('status')).toHaveTextContent('2개 중 2번째 시리즈, mdx');
  await expect.element(next).toBeEnabled();
  await screen.getByRole('button', { name: '1번 시리즈: 블로그 개발기', exact: true }).click();
  await expect.element(first.getByRole('heading', { name: '블로그 개발기', exact: true })).toBeVisible();
  await expect
    .element(screen.getByRole('button', { name: '1번 시리즈: 블로그 개발기', exact: true }))
    .toHaveAttribute('aria-pressed', 'true');
  await screen.rerender(<HomeSeries items={[items[0]!]} />);
  await expect.element(screen.getByRole('link', { name: '블로그 개발기 시리즈 보기' })).toBeVisible();
  await expect.element(screen.getByRole('button', { name: '다음 시리즈', exact: true })).not.toBeInTheDocument();
});

test('여러 시리즈를 오가도 제목을 복제하지 않고 순환 전환과 번호 탐색의 현재 선택을 알린다', async () => {
  const items: HomeSeriesItem[] = Array.from({ length: 5 }, (_, index) => ({
    id: `series-${index}`,
    kind: 'series',
    title: `시리즈 ${index + 1}`,
    summary: `시리즈 ${index + 1}의 목적`,
    href: `/series/series-${index}`,
    tags: [],
    dateTime: null,
    postCount: index + 1,
  }));
  const screen = await render(<HomeSeries items={items} />);
  const next = screen.getByRole('button', { name: '다음 시리즈', exact: true });
  const previous = screen.getByRole('button', { name: '이전 시리즈', exact: true });
  for (let index = 0; index < items.length; index++) {
    await expect
      .element(screen.getByRole('button', { name: `시리즈 ${index + 1} 선택`, exact: true }))
      .toHaveAttribute('aria-pressed', 'true');
    await expect
      .element(screen.getByRole('status'))
      .toHaveTextContent(`5개 중 ${index + 1}번째 시리즈, 시리즈 ${index + 1}`);
    if (index < items.length - 1) await next.click();
  }
  await expect.element(next).toBeEnabled();
  await next.click();
  await expect
    .element(screen.getByRole('button', { name: '시리즈 1 선택', exact: true }))
    .toHaveAttribute('aria-pressed', 'true');
  await screen.getByRole('button', { name: '5번 시리즈: 시리즈 5', exact: true }).click();
  await previous.click();
  await expect
    .element(screen.getByRole('button', { name: '시리즈 4 선택', exact: true }))
    .toHaveAttribute('aria-pressed', 'true');
  await expect.element(previous).toBeEnabled();
});

test('시리즈가 없으면 선택 조작 대신 준비 안내와 목록 링크를 제공한다', async () => {
  const screen = await render(<HomeSeries items={[]} />);
  await expect.element(screen.getByText('새로운 시리즈를 준비하고 있어요.')).toBeVisible();
  await expect.element(screen.getByRole('group', { name: '시리즈 선택' })).not.toBeInTheDocument();
  await expect
    .element(screen.getByRole('link', { name: '시리즈 목록 보러가기' }))
    .toHaveAttribute('href', '/series?showType=carousel');
});
