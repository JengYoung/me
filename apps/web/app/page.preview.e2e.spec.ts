import { expect, test, type Locator, type Page } from '@playwright/test';

async function openHome(page: Page, dark = false) {
  await page.goto('/');
  if (dark)
    await page.locator('html').evaluate((element) => {
      element.dataset.theme = 'dark';
    });
  await expect(page.getByRole('button', { name: '소개 보기', exact: true })).toBeVisible();
}

async function reveal(page: Page) {
  await page.getByRole('button', { name: '소개 보기', exact: true }).click();
  await expect(page.locator('[data-grid-pulse]')).toHaveAttribute('data-phase', 'settled', { timeout: 15_000 });
  await expect(page.locator('main')).toHaveAttribute('data-scroll-locked', 'false');
  await expect(page.getByText('안녕하세요, 개발자', { exact: false })).toBeVisible();
}

async function finishMotion(target: Locator) {
  await target.evaluate(async (element) => {
    await Promise.allSettled(
      element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished),
    );
  });
}

test('첫 문서 스크롤로 파동·낙하·소개를 표시하고 역스크롤과 리사이즈에서 반복하지 않는다', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openHome(page, info.project.use.colorScheme === 'dark');
  await expect(page).toHaveTitle('황재영 | Break the Brake');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://jengyoung.co.kr/');
  await expect(page.locator('[data-hero-copy]')).toHaveAttribute('data-position', 'fixed');
  await page.screenshot({ path: info.outputPath('home-initial.png') });
  await page.locator('[data-grid-pulse]').evaluate((element) => {
    const phases: string[] = [];
    const observer = new MutationObserver(() => {
      const phase = element.getAttribute('data-phase')!;
      if (phases.at(-1) !== phase) phases.push(phase);
      element.setAttribute('data-observed-phases', phases.join(','));
      if (phase === 'settled') observer.disconnect();
    });
    observer.observe(element, { attributes: true, attributeFilter: ['data-phase'] });
  });
  await page.keyboard.press('PageDown');
  await expect(page.locator('main')).toHaveAttribute('data-scroll-locked', 'true');
  const size = page.viewportSize()!;
  await page.setViewportSize({ width: size.width, height: size.height - 40 });
  await expect(page.locator('[data-grid-pulse]')).toHaveAttribute('data-phase', 'settled', { timeout: 15_000 });
  await expect(page.locator('main')).toHaveAttribute('data-scroll-locked', 'false');
  const phases = await page.locator('[data-grid-pulse]').getAttribute('data-observed-phases');
  expect(phases?.split(',')).toEqual(expect.arrayContaining(['wave', 'breaking', 'settled']));
  await expect(page.locator('[data-hero-copy]')).toHaveAttribute('data-position', 'relative');
  await expect(page.getByText('안녕하세요, 개발자', { exact: false })).toBeVisible();
  await finishMotion(page.locator('main'));
  await page.screenshot({ path: info.outputPath('home-introduction.png') });
  await page.evaluate(() => window.scrollTo(0, innerHeight));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('[data-grid-pulse]')).toHaveAttribute('data-phase', 'settled');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('실제 글 큐브를 키보드로 읽고 상세 이동과 홈 재진입을 지원한다', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const kind of ['post']) {
    await openHome(page, info.project.use.colorScheme === 'dark');
    await reveal(page);
    const cubes = page.locator(`[data-content-cube="${kind}"]`);
    expect(await cubes.count()).toBeGreaterThan(0);
    expect(await cubes.count()).toBeLessThanOrEqual(3);
    const cube = cubes.first();
    const link = cube.getByRole('link');
    const title = await cube.getByRole('heading', { level: 3 }).textContent();
    await link.focus();
    await expect(cube).toHaveAttribute('data-expanded', 'true');
    await expect(cube.getByRole('region', { name: /요약$/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(cube).toHaveAttribute('data-expanded', 'false');
    await expect(link).toBeFocused();
    await expect(cube.locator('img')).toHaveAttribute('src', /\S/);
    await page.screenshot({ path: info.outputPath(`home-${kind}-cube.png`) });
    const href = await link.getAttribute('href');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title!);
    await page.goBack();
    await expect(page.getByRole('button', { name: '소개 보기', exact: true })).toBeVisible();
    await expect(page.locator('[data-grid-pulse]')).toHaveAttribute('data-phase', 'pulse');
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('[data-grid-pulse]')).toHaveCount(1);
  }
});

test('홈 시리즈 캐러셀은 큰 썸네일·제목·설명·글 수와 중앙 화살표를 표시한다', async ({ page, isMobile }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openHome(page, info.project.use.colorScheme === 'dark');
  await reveal(page);
  const section = page.getByRole('region', { name: '이런 것들에 관심 가지며 개발하고 있어요', exact: true });
  const carousel = section.getByRole('region', { name: '홈 시리즈 캐러셀', exact: true });
  const postSection = page.getByRole('region', { name: '최근에 이런 글들을 썼어요', exact: true });
  const seriesBounds = (await section.boundingBox())!;
  const postBounds = (await postSection.boundingBox())!;
  expect(seriesBounds.x).toBe(postBounds.x);
  expect(seriesBounds.width).toBe(postBounds.width);
  await expect(section.getByRole('heading', { name: '최근 글', exact: true })).toHaveCount(0);
  const choices = carousel.locator('[data-series-titles] [data-part="picker"]');
  const count = await choices.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(3);
  const next = carousel.getByRole('button', { name: '다음 시리즈', exact: true });
  const previous = carousel.getByRole('button', { name: '이전 시리즈', exact: true });
  for (let index = 0; index < count; index++) {
    if (index > 0) {
      await next.focus();
      await page.keyboard.press('Enter');
    }
    await expect(choices.nth(index)).toHaveAttribute('aria-pressed', 'true');
    const panel = carousel.locator('[data-part="viewport"] > [data-part="slide"]:not([hidden])');
    const cover = panel.locator('[data-series-cover]');
    const title = panel.getByRole('heading', { level: 3 });
    await expect(title).toBeVisible();
    await expect(panel.locator('p').first()).not.toBeEmpty();
    await expect(panel.locator('p').last()).toHaveText(/\d+개의 글/);
    const image = cover.locator('img');
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0))
      .toBe(true);
    const wheel = await carousel.locator('[data-series-titles]').evaluate((element) => {
      const box = element.getBoundingClientRect();
      const active = element.querySelector<HTMLElement>('[aria-pressed="true"]')!;
      const activeBox = active.getBoundingClientRect();
      return {
        height: box.height,
        rowHeight: activeBox.height,
        centerOffset: activeBox.y + activeBox.height / 2 - box.y - box.height / 2,
        activeBlur: getComputedStyle(active).filter,
        neighbors: [...element.querySelectorAll<HTMLElement>('[aria-pressed="false"]')].map((item) => {
          const rect = item.getBoundingClientRect();
          return {
            visibleHeight: Math.max(0, Math.min(rect.bottom, box.bottom) - Math.max(rect.top, box.top)),
            blur: getComputedStyle(item).filter,
          };
        }),
      };
    });
    expect(wheel.height).toBe(wheel.rowHeight * 1.5);
    expect(Math.abs(wheel.centerOffset)).toBeLessThan(1);
    expect(wheel.activeBlur).toBe('none');
    for (const neighbor of wheel.neighbors) {
      expect(neighbor.visibleHeight).toBeLessThanOrEqual(wheel.rowHeight / 4);
      expect(neighbor.blur).not.toBe('none');
    }
    const coverBox = (await cover.boundingBox())!;
    const panelBox = (await panel.boundingBox())!;
    const heading = section.getByRole('heading', { level: 2 });
    const headingBox = (await heading.boundingBox())!;
    const selectorBox = (await carousel.getByRole('group', { name: '시리즈 선택' }).boundingBox())!;
    const headingLines = await heading.evaluate(
      (element) => element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight),
    );
    expect(headingLines).toBe(2);
    const listLinkBox = (await section.getByRole('link', { name: '시리즈 목록 보러가기', exact: true }).boundingBox())!;
    expect(listLinkBox.y + listLinkBox.height).toBeLessThanOrEqual(headingBox.y);
    expect(listLinkBox.y + listLinkBox.height).toBeLessThan(selectorBox.y);
    expect((await title.boundingBox())!.y).toBeGreaterThanOrEqual(coverBox.y + coverBox.height);
    if (isMobile) {
      expect(coverBox.y).toBeGreaterThan(listLinkBox.y + listLinkBox.height);
      expect(selectorBox.y).toBeGreaterThan(panelBox.y + panelBox.height);
    } else {
      expect(panelBox.x).toBeGreaterThan(headingBox.x + headingBox.width);
    }
    if (count > 1) {
      const wheelBox = (await carousel.locator('[data-series-titles]').boundingBox())!;
      const previousBox = (await previous.boundingBox())!;
      const nextBox = (await next.boundingBox())!;
      expect(Math.abs(previousBox.x + previousBox.width / 2 - wheelBox.x - wheelBox.width / 2)).toBeLessThan(1);
      expect(Math.abs(nextBox.x + nextBox.width / 2 - wheelBox.x - wheelBox.width / 2)).toBeLessThan(1);
      expect(previousBox.y + previousBox.height).toBeLessThanOrEqual(wheelBox.y);
      expect(nextBox.y).toBeGreaterThanOrEqual(wheelBox.y + wheelBox.height);
      expect(await next.evaluate((element) => getComputedStyle(element).borderTopWidth)).toBe('0px');
      await expect(next.locator('svg')).toHaveAttribute('width', '16');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await section.screenshot({ path: info.outputPath('home-series-' + index + '.png') });
  }
  if (count > 1) await expect(next).toBeEnabled();
  const detail = carousel
    .locator('[data-part="viewport"] > [data-part="slide"]:not([hidden])')
    .getByRole('heading', { level: 3 })
    .getByRole('link');
  const title = await detail.textContent();
  const href = await detail.getAttribute('href');
  await detail.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(href + '$'));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title!);
  expect(errors).toEqual([]);
});

test('홈 시리즈 슬라이드와 제목 롤링·진행 표시가 같은 방향으로 함께 전환된다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page);
  await reveal(page);
  const carousel = page.getByRole('region', { name: '홈 시리즈 캐러셀', exact: true });
  test.skip(
    (await carousel.locator('[data-series-titles] [data-part="picker"]').count()) < 2,
    '두 개 이상의 실제 시리즈',
  );
  await carousel.scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const direction of ['next', 'previous'] as const) {
    const beforeY = await carousel
      .locator('[data-series-titles] > div')
      .evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42);
    await carousel.evaluate((root) => {
      const freeze = (event: Event) => {
        if ((event as TransitionEvent).propertyName !== 'transform') return;
        root.removeEventListener('transitionrun', freeze);
        for (const animation of root.getAnimations({ subtree: true })) {
          const duration = animation.effect?.getTiming().duration;
          if (typeof duration !== 'number') continue;
          animation.pause();
          animation.currentTime = duration / 3;
        }
      };
      root.addEventListener('transitionrun', freeze);
    });
    await carousel
      .getByRole('button', { name: direction === 'next' ? '다음 시리즈' : '이전 시리즈', exact: true })
      .click();
    await expect
      .poll(() =>
        carousel.evaluate((root) =>
          root.getAnimations({ subtree: true }).some((animation) => animation.playState === 'paused'),
        ),
      )
      .toBe(true);
    const frame = await carousel.evaluate((root) => {
      const active = root.querySelector<HTMLElement>('[data-part="viewport"] > [data-part="slide"]:not([hidden])')!;
      const old = root.querySelector<HTMLElement>('[data-part="viewport"] > [data-part="slide"][hidden]')!;
      const track = root.querySelector<HTMLElement>('[data-series-titles] > div')!;
      return {
        x: new DOMMatrixReadOnly(getComputedStyle(active).transform).m41,
        y: new DOMMatrixReadOnly(getComputedStyle(track).transform).m42,
        hiddenInert: old.inert,
        animations: root.getAnimations({ subtree: true }).length,
      };
    });
    expect(frame.animations).toBeGreaterThanOrEqual(3);
    expect(frame.hiddenInert).toBe(true);
    if (direction === 'next') {
      expect(frame.x).toBeGreaterThan(0);
      expect(frame.y).toBeLessThan(beforeY);
    } else {
      expect(frame.x).toBeLessThan(0);
      expect(frame.y).toBeGreaterThan(beforeY);
    }
    await carousel.evaluate(async (root) => {
      const animations = root.getAnimations({ subtree: true });
      for (const animation of animations) animation.play();
      await Promise.allSettled(animations.map((animation) => animation.finished));
    });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await carousel.getByRole('button', { name: '다음 시리즈', exact: true }).click();
  expect(await carousel.evaluate((root) => root.getAnimations({ subtree: true }).length)).toBe(0);
});

test('모바일 홈 시리즈는 썸네일 스와이프로 전환하고 링크 클릭과 세로 스크롤을 구분한다', async ({ page, isMobile }) => {
  test.skip(!isMobile, '모바일 터치 입력');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page);
  await reveal(page);
  const carousel = page.getByRole('region', { name: '홈 시리즈 캐러셀', exact: true });
  test.skip(
    (await carousel.locator('[data-series-titles] [data-part="picker"]').count()) < 2,
    '두 개 이상의 실제 시리즈',
  );
  const cover = carousel.locator('[data-series-cover]:visible');
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
    await expect(carousel.locator('[data-series-titles] [data-part="picker"]').nth(1)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page).toHaveURL(/\/$/);
    await cover.scrollIntoViewIfNeeded();
    const nextBox = (await cover.boundingBox())!;
    const beforeScroll = await page.evaluate(() => scrollY);
    const center = { x: nextBox.x + nextBox.width / 2, y: nextBox.y + nextBox.height / 2 };
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [center] });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: center.x, y: center.y - 80 }],
    });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(beforeScroll);
    await expect(carousel.locator('[data-series-titles] [data-part="picker"]').nth(1)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  } finally {
    await session.detach();
  }
});

test('큐브는 화면에 나타나 부유하고 마우스 또는 터치로 상세 페이지를 연다', async ({ page, isMobile }, info) => {
  await openHome(page, info.project.use.colorScheme === 'dark');
  await reveal(page);
  const cube = page.locator('[data-content-cube="post"]').first();
  await cube.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect(cube).toHaveAttribute('data-entered', 'true');
  await finishMotion(cube);
  if (!isMobile) {
    await cube.hover();
    await expect(cube).toHaveAttribute('data-expanded', 'true');
    await finishMotion(cube);
    await page.screenshot({ path: info.outputPath('home-cube-hover.png') });
    await page.mouse.move(0, 0);
    await expect(cube).toHaveAttribute('data-expanded', 'false');
    await finishMotion(cube);
  }
  const link = cube.getByRole('link');
  const href = await link.getAttribute('href');
  if (isMobile) await link.tap();
  else await link.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  expect(await page.locator('[data-grid-pulse]').count()).toBe(0);
  expect(await page.locator('body').evaluate((element) => getComputedStyle(element).overflowY)).not.toBe('hidden');
});

test('Canvas와 View Transition이 없어도 소개·스크롤·링크를 사용할 수 있다', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
    Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true });
  });
  await openHome(page);
  await reveal(page);
  const link = page.getByRole('link', { name: '시리즈 목록 보러가기', exact: true });
  await link.click();
  await expect(page).toHaveURL(/\/series\?showType=carousel$/);
});

test('메뉴 내부 입력으로 격자가 깨지지 않고 소개 전환 중에도 메뉴를 사용할 수 있다', async ({ page }) => {
  await openHome(page);
  const trigger = page.getByRole('button', { name: '메뉴 열기', exact: true });
  const dialog = page.getByRole('dialog', { name: '둘러보기', exact: true });
  await trigger.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('PageDown');
  await expect(page.locator('[data-grid-pulse]')).toHaveAttribute('data-phase', 'pulse');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: '소개 보기', exact: true }).click();
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(page.locator('[data-grid-pulse]')).toHaveAttribute('data-phase', 'settled', { timeout: 15_000 });
  await expect(page.locator('main')).toHaveAttribute('data-scroll-locked', 'false');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('PageDown');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test('JavaScript 없는 환경에서도 소개와 실제 콘텐츠 링크를 제공한다', async ({ browser, baseURL }, info) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: info.project.use.viewport });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Break');
    await expect(page.getByText('안녕하세요, 개발자', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: '소개 보기', exact: true })).toHaveCount(0);
    const series = page.getByRole('region', { name: '이런 것들에 관심 가지며 개발하고 있어요', exact: true });
    await expect(series.getByRole('region', { name: '홈 시리즈 캐러셀', exact: true })).toBeHidden();
    const seriesLinks = series.getByRole('link', { name: /시리즈 보기$/ });
    expect(await seriesLinks.count()).toBeGreaterThan(0);
    for (const link of await seriesLinks.all()) await expect(link).toBeVisible();
    await expect(series.locator('a[href^="/posts/"]')).toHaveCount(0);
    const link = page.locator('[data-content-cube="post"]').first().getByRole('link');
    const href = await link.getAttribute('href');
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  } finally {
    await context.close();
  }
});

test('홈 시리즈 자동 재생은 진행 바와 함께 순환하고 일시정지·재생·번호 선택에 반응한다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page);
  await reveal(page);
  const carousel = page.getByRole('region', { name: '홈 시리즈 캐러셀', exact: true });
  const choices = carousel.locator('[data-series-titles] [data-part="picker"]');
  const count = await choices.count();
  test.skip(count < 2, '두 개 이상의 실제 시리즈');
  const clockStart = new Date('2026-10-26T00:00:00Z');
  await page.clock.install({ time: clockStart });
  await page.clock.pauseAt(new Date(clockStart.valueOf() + 1000));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await carousel.getByRole('button', { name: '자동 재생 시작', exact: true }).click();
  await page.mouse.move(0, 0);
  await expect(carousel).toHaveAttribute('data-rotating', 'true');
  const progress = carousel.locator('[data-playback-progress]');
  await expect(progress).toHaveAttribute('data-running', 'true');
  expect(await progress.evaluate((element) => element.getAnimations()[0]?.effect?.getTiming().duration)).toBe(5000);
  await page.clock.runFor(4999);
  await expect(choices.first()).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(1);
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(carousel.getByRole('button', { name: '자동 재생 일시정지', exact: true })).toBeVisible();
  await carousel.getByRole('button', { name: '자동 재생 일시정지', exact: true }).click();
  await expect(carousel).toHaveAttribute('data-rotating', 'false');
  await expect(progress).toHaveAttribute('data-running', 'false');
  expect(
    await progress.evaluate((element) =>
      element.getAnimations().every((animation) => animation.playState === 'paused'),
    ),
  ).toBe(true);
  await page.clock.runFor(15000);
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await carousel.getByRole('button', { name: '자동 재생 시작', exact: true }).click();
  await page.mouse.move(0, 0);
  await expect(carousel).toHaveAttribute('data-rotating', 'true');
  await page.clock.runFor(5000 * (count - 1));
  await expect(choices.first()).toHaveAttribute('aria-pressed', 'true');
  // 마우스 클릭으로 버튼에 포커스하지 않는 브라우저도 직접 탐색 시 자동 재생을 중지한다.
  await carousel.getByRole('button', { name: '다음 시리즈', exact: true }).dispatchEvent('click');
  await expect(carousel).toHaveAttribute('data-rotating', 'false');
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await carousel.getByRole('button', { name: '자동 재생 시작', exact: true }).click();
  await page.mouse.move(0, 0);
  await expect(carousel).toHaveAttribute('data-rotating', 'true');
  const number = carousel.getByRole('group', { name: '시리즈 번호 선택', exact: true }).getByRole('button').first();
  await number.click();
  await expect(number).toHaveAttribute('aria-pressed', 'true');
  await expect(carousel).toHaveAttribute('data-rotating', 'false');
  await page.clock.runFor(10000);
  await expect(choices.first()).toHaveAttribute('aria-pressed', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(carousel.getByRole('button', { name: '자동 재생 시작', exact: true })).toBeDisabled();
  expect(await progress.evaluate((element) => element.getAnimations().length)).toBe(0);
});
