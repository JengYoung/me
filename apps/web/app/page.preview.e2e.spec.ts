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

test('실제 글·시리즈 큐브를 키보드로 읽고 상세 이동과 홈 재진입을 지원한다', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const kind of ['post', 'series']) {
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
    const link = page.locator('[data-content-cube="post"]').first().getByRole('link');
    const href = await link.getAttribute('href');
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  } finally {
    await context.close();
  }
});
