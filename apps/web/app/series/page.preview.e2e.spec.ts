import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { parse } from 'yaml';

const docs = path.resolve(import.meta.dirname, '../../docs');
const registry: { id: string; label?: string; title: string }[] = JSON.parse(
  await readFile(path.join(docs, 'series/series.json'), 'utf8'),
);
const groups = new Map<string, { id: string; title: string; order: number }[]>();
const collator = new Intl.Collator('en', { numeric: true });
for (const directory of await readdir(path.join(docs, 'posts'), { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  const files = await readdir(path.join(docs, 'posts', directory.name));
  const drafts = files.filter((file) => /^0\.\d+\.\d+(?:\.local)?\.mdx?$/.test(file));
  const published = files.filter((file) => /^[1-9]\d*\.\d+\.\d+\.mdx$/.test(file));
  const file = [...(drafts.length ? drafts : published)].sort(collator.compare).at(-1);
  if (!file) continue;
  const source = await readFile(path.join(docs, 'posts', directory.name, file), 'utf8');
  const metadata = parse(/^---\r?\n([\s\S]*?)\r?\n---/.exec(source)![1]!);
  if (!metadata.series) continue;
  const members = groups.get(metadata.series.id) ?? [];
  members.push({ id: directory.name, title: metadata.title, order: metadata.series.order });
  groups.set(metadata.series.id, members);
}
// oxlint-disable-next-line unicorn/no-array-sort -- 테스트가 파일에서 수집한 새 배열이다.
for (const members of groups.values()) members.sort((a, b) => a.order - b.order);

test('실제 시리즈의 리스트·캐러셀을 URL로 전환하고 키보드와 뒤로가기로 탐색한다', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/series');
  if (testInfo.project.use.colorScheme === 'dark') {
    await page.locator('html').evaluate((element) => {
      element.dataset.theme = 'dark';
    });
  }
  const list = page.getByRole('list', { name: '모든 시리즈' });
  await expect(list.getByRole('listitem')).toHaveCount(groups.size);
  for (const item of registry.filter((entry) => groups.has(entry.id) && entry.label?.trim())) {
    const link = list
      .getByRole('link')
      .filter({ has: page.getByRole('heading', { name: item.label!.trim(), exact: true }) });
    await expect(link).toHaveAttribute('href', `/series/${item.id}`);
  }
  const firstHref = await list.getByRole('link').first().getAttribute('href');
  const firstTitle = await list.getByRole('heading').first().textContent();
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://jengyoung.co.kr/series');
  await page.getByRole('link', { name: '캐러셀로 보기', exact: true }).click();
  await expect(page).toHaveURL(/\/series\?showType=carousel$/);
  const carousel = page.getByRole('region', { name: '시리즈 둘러보기' });
  await expect(carousel).toBeVisible();
  await expect(carousel.getByRole('group')).toHaveCount(1);
  await expect(carousel.getByRole('group').getByRole('heading', { level: 2 })).toHaveText(firstTitle!);
  if (groups.size > 1) {
    const next = carousel.getByRole('button', { name: '다음 시리즈' });
    await next.focus();
    await page.keyboard.press('Enter');
    await expect(carousel.getByRole('group').getByRole('heading', { level: 2 }).getByRole('link')).not.toHaveAttribute(
      'href',
      firstHref!,
    );
    await carousel.getByRole('button', { name: '이전 시리즈' }).click();
    await expect(carousel.getByRole('group').getByRole('heading', { level: 2 }).getByRole('link')).toHaveAttribute(
      'href',
      firstHref!,
    );
  }
  await page.getByRole('link', { name: '리스트로 보기', exact: true }).click();
  await expect(page).toHaveURL(/\/series$/);
  await page.goBack();
  await expect(carousel).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('시리즈 상세와 포스트의 전체 챕터·현재 위치·이전 다음이 같은 순서다', async ({ page }) => {
  test.skip(groups.size === 0, '실제 원고에 시리즈가 없습니다.');
  const [id, posts] = [...groups.entries()][0]!;
  const definition = registry.find((item) => item.id === id)!;
  const title = definition.label?.trim() || definition.title.trim() || id;
  await page.goto(`/series/${id}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  await expect(page).toHaveTitle(title);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://jengyoung.co.kr/series/${id}`);
  const chapters = page.getByRole('list', { name: '시리즈 글 목록' });
  await expect(chapters.getByRole('heading')).toHaveText(posts.map((post) => post.title));
  await expect(chapters.getByText(/번째 글$/)).toHaveText(posts.map((_, index) => `${index + 1}번째 글`));
  await page.getByRole('link', { name: '첫 글부터 읽기' }).click();
  await expect(page).toHaveURL(new RegExp(`/posts/${posts[0]!.id}$`));
  const navigation = page.getByRole('navigation', { name: '현재 시리즈 탐색' });
  await expect(navigation.getByRole('heading', { level: 2 })).toHaveText(title);
  await expect(navigation.getByRole('list', { name: '현재 시리즈 목차' }).getByRole('link')).toHaveCount(posts.length);
  await expect(navigation.locator('a[aria-current=page]')).toHaveAttribute('href', `/posts/${posts[0]!.id}`);
  await expect(navigation.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await expect(navigation.getByRole('link', { name: /^이전 글/ })).toHaveCount(0);
  if (posts.length > 1) {
    await navigation.getByRole('link', { name: /^다음 글/ }).click();
    await expect(page).toHaveURL(new RegExp(`/posts/${posts[1]!.id}$`));
    await expect(navigation.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  }
  await page.goto(`/series/${id}`);
  await page.getByRole('link', { name: '시리즈 목록 보러가기' }).click();
  await expect(page).toHaveURL(/\/series$/);
  const response = await page.goto('/series/does-not-exist');
  expect(response?.status()).toBe(404);
});

test('JavaScript 없이도 캐러셀 보기의 모든 시리즈를 목록으로 읽는다', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto('/series?showType=carousel');
    const list = page.getByRole('list', { name: '모든 시리즈' });
    await expect(list).toBeVisible();
    await expect(list.getByRole('listitem')).toHaveCount(groups.size);
    await expect(page.getByRole('region', { name: '시리즈 둘러보기' })).not.toBeVisible();
  } finally {
    await context.close();
  }
});

test('모바일에서 가로 스와이프는 시리즈를 전환하고 링크로 이동하지 않는다', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.isMobile || groups.size < 2, '두 개 이상 시리즈의 모바일 동작');
  await page.goto('/series?showType=carousel');
  const carousel = page.getByRole('region', { name: '시리즈 둘러보기' });
  // 실제 조작으로 hydration을 기다린다.
  await carousel.getByRole('button', { name: '다음 시리즈' }).click();
  const active = carousel.getByRole('group');
  const title = await active.getByRole('heading', { level: 2 }).textContent();
  const cover = active.getByRole('link', { name: /시리즈 썸네일$/ });
  await cover.scrollIntoViewIfNeeded();
  const box = (await cover.boundingBox())!;
  const session = await page.context().newCDPSession(page);
  try {
    const y = box.y + box.height / 2;
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: box.x + box.width * 0.8, y }],
    });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: box.x + box.width * 0.2, y }],
    });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(active.getByRole('heading', { level: 2 })).not.toHaveText(title!);
    await expect(page).toHaveURL(/\/series\?showType=carousel$/);
  } finally {
    await session.detach();
  }
});

async function pauseSlideTransition(carousel: Locator) {
  await carousel.evaluate((root) => {
    // 이 테스트의 페이지가 소유한 전환을 한 번만 고정한다. 페이지 종료 시 리스너도 정리된다.
    const freeze = (event: Event) => {
      const transition = event as TransitionEvent;
      if (transition.propertyName !== 'transform' || !(transition.target as HTMLElement).matches('[data-part="slide"]'))
        return;
      root.removeEventListener('transitionrun', freeze);
      for (const animation of root.getAnimations({ subtree: true })) {
        const duration = animation.effect?.getTiming().duration;
        if (typeof duration !== 'number') continue;
        animation.pause();
        animation.currentTime = duration / 5;
      }
    };
    root.addEventListener('transitionrun', freeze);
  });
}

test('슬라이드 전체가 좌우로 이어서 이동하고 전환 중인 이전 글은 탐색에서 제외된다', async ({ page }, testInfo) => {
  test.skip(groups.size < 2, '두 개 이상의 실제 시리즈가 필요합니다.');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/series?showType=carousel');
  if (testInfo.project.use.colorScheme === 'dark') {
    await page.locator('html').evaluate((element) => {
      element.dataset.theme = 'dark';
    });
  }
  const carousel = page.getByRole('region', { name: '시리즈 둘러보기' });
  // 실제 조작으로 hydration을 기다린다.
  await carousel.getByRole('button', { name: '다음 시리즈' }).click();
  await carousel.evaluate(async (root) => {
    await Promise.allSettled(root.getAnimations({ subtree: true }).map((animation) => animation.finished));
  });

  for (const direction of ['next', 'previous'] as const) {
    const outgoingId = await carousel.getByRole('group').getAttribute('id');
    await pauseSlideTransition(carousel);
    await carousel.getByRole('button', { name: direction === 'next' ? '다음 시리즈' : '이전 시리즈' }).click();
    await expect
      .poll(() =>
        carousel.evaluate((root) =>
          root.getAnimations({ subtree: true }).some((animation) => animation.playState === 'paused'),
        ),
      )
      .toBe(true);
    const frame = await carousel.evaluate((root, outgoingId) => {
      const outgoing = root.querySelector<HTMLElement>(`[id="${outgoingId}"]`)!;
      const incoming = root.querySelector<HTMLElement>('[data-part="slide"]:not([hidden])')!;
      const read = (element: HTMLElement) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          x: rect.x,
          width: rect.width,
          offset: new DOMMatrixReadOnly(style.transform).m41,
          display: style.display,
          inert: element.inert,
          ariaHidden: element.getAttribute('aria-hidden'),
        };
      };
      return { outgoing: read(outgoing), incoming: read(incoming) };
    }, outgoingId);
    expect(frame.outgoing.display).not.toBe('none');
    expect(frame.outgoing.inert).toBe(true);
    expect(frame.outgoing.ariaHidden).toBe('true');
    expect(frame.incoming.inert).toBe(false);
    expect(Math.abs(frame.outgoing.offset)).toBeGreaterThan(frame.outgoing.width / 8);
    expect(Math.abs(frame.incoming.offset)).toBeGreaterThan(frame.incoming.width / 8);
    if (direction === 'next') {
      expect(frame.outgoing.offset).toBeLessThan(0);
      expect(frame.incoming.offset).toBeGreaterThan(0);
      expect(Math.abs(frame.outgoing.x + frame.outgoing.width - frame.incoming.x)).toBeLessThan(1);
    } else {
      expect(frame.outgoing.offset).toBeGreaterThan(0);
      expect(frame.incoming.offset).toBeLessThan(0);
      expect(Math.abs(frame.incoming.x + frame.incoming.width - frame.outgoing.x)).toBeLessThan(1);
    }
    await expect(carousel.getByRole('group')).toHaveCount(1);
    await carousel.evaluate(async (root) => {
      const animations = root.getAnimations({ subtree: true });
      for (const animation of animations) animation.play();
      await Promise.allSettled(animations.map((animation) => animation.finished));
    });
  }

  const title = await carousel.getByRole('group').getByRole('heading', { level: 2 }).textContent();
  for (let index = 0; index < 3; index++) {
    await carousel.getByRole('button', { name: '다음 시리즈' }).click();
    await carousel.getByRole('button', { name: '이전 시리즈' }).click();
  }
  await carousel.evaluate(async (root) => {
    await Promise.allSettled(root.getAnimations({ subtree: true }).map((animation) => animation.finished));
  });
  await expect(carousel.getByRole('group').getByRole('heading', { level: 2 })).toHaveText(title!);
  expect(
    await carousel.evaluate((root) =>
      [...root.querySelectorAll('[data-part="slide"][hidden]')].every(
        (slide) => getComputedStyle(slide).display === 'none',
      ),
    ),
  ).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await carousel.getByRole('button', { name: '다음 시리즈' }).click();
  await expect(carousel.getByRole('group')).toHaveCount(1);
  expect(await carousel.evaluate((root) => root.getAnimations({ subtree: true }).length)).toBe(0);
});

test('같은 방향의 연속 입력은 현재 이동 뒤에 이어지고 동작 줄이기로 전환해도 입력이 남지 않는다', async ({ page }) => {
  test.skip(groups.size < 2, '두 개 이상의 실제 시리즈가 필요합니다.');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/series?showType=carousel');
  const carousel = page.getByRole('region', { name: '시리즈 둘러보기' });
  const next = carousel.getByRole('button', { name: '다음 시리즈' });
  await next.click();
  await carousel.evaluate(async (root) => {
    await Promise.allSettled(root.getAnimations({ subtree: true }).map((animation) => animation.finished));
  });

  for (const reduceDuringTransition of [false, true]) {
    const expectedTitle = await carousel.evaluate((root) => {
      const slides = [...root.querySelectorAll<HTMLElement>('[data-part="slide"]')];
      const index = slides.findIndex((slide) => !slide.hidden);
      return slides[(index + 2) % slides.length]!.querySelector('h2')!.textContent!;
    });
    await pauseSlideTransition(carousel);
    await next.click();
    await expect
      .poll(() =>
        carousel.evaluate((root) =>
          root.getAnimations({ subtree: true }).some((animation) => animation.playState === 'paused'),
        ),
      )
      .toBe(true);
    const incomingId = await carousel.getByRole('group').getAttribute('id');
    await next.click();
    await expect(carousel.getByRole('group')).toHaveAttribute('id', incomingId!);

    if (reduceDuringTransition) {
      await page.emulateMedia({ reducedMotion: 'reduce' });
    } else {
      await carousel.evaluate(async (root) => {
        const animations = root.getAnimations({ subtree: true });
        for (const animation of animations) animation.play();
        await Promise.allSettled(animations.map((animation) => animation.finished));
      });
    }
    await expect(carousel.getByRole('group').getByRole('heading', { level: 2 })).toHaveText(expectedTitle);
    await carousel.evaluate(async (root) => {
      await Promise.allSettled(root.getAnimations({ subtree: true }).map((animation) => animation.finished));
    });
    expect(await carousel.evaluate((root) => root.getAnimations({ subtree: true }).length)).toBe(0);
  }
});
