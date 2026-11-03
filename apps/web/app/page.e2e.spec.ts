import { expect, test } from '@playwright/test';

// page.tsx가 제공하는 홈 진입점에서 앱의 기동·리소스·라우팅을 검사한다.
// 공통 Header·Sidebar의 사용자 흐름은 layout.e2e.spec.ts에서 검사한다.
test('홈 문서와 앱 리소스를 오류 없이 불러온다', async ({ page }) => {
  const runtimeErrors: string[] = [];
  const failedResources: string[] = [];

  // page fixture가 각 테스트의 페이지와 이벤트 구독을 함께 정리한다.
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    // Next.js가 취소한 추측 prefetch는 페이지에 필요한 리소스의 로딩 실패가 아닙니다.
    if (
      request.failure()?.errorText === 'net::ERR_ABORTED' &&
      request.headers()['next-router-prefetch'] === '1' &&
      request.headers().rsc === '1'
    ) {
      return;
    }
    failedResources.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
  });
  page.on('response', (response) => {
    if (['script', 'stylesheet', 'font'].includes(response.request().resourceType()) && response.status() >= 400) {
      failedResources.push(`${response.status()} ${response.url()}`);
    }
  });

  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  expect(response?.headers()['content-type']).toContain('text/html');
  await expect(page).toHaveTitle(/\S/);
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('script[src]')).not.toHaveCount(0);
  await expect(page.locator('link[rel="stylesheet"]')).not.toHaveCount(0);
  await expect(page.locator('body')).toHaveCSS('overflow-x', 'clip');
  await expect(page.locator('body')).toHaveCSS('font-family', /Pretendard Variable/);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          [...document.fonts].some((font) => font.family.includes('Pretendard Variable') && font.status === 'loaded') &&
          document.fonts.check('400 16px "Pretendard Variable"', '소개 보기'),
      ),
    )
    .toBe(true);
  expect(failedResources, '앱 리소스 요청 실패').toEqual([]);
  expect(runtimeErrors, '초기 로딩 중 브라우저 오류').toEqual([]);
});

test('JavaScript 없이도 같은 폰트로 홈을 읽고 목록으로 이동할 수 있다', async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: testInfo.project.use.viewport,
  });
  try {
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Break');
    await expect(page.getByText('안녕하세요, 개발자', { exact: false })).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('font-family', /Pretendard Variable/);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            [...document.fonts].some(
              (font) => font.family.includes('Pretendard Variable') && font.status === 'loaded',
            ) && document.fonts.check('400 16px "Pretendard Variable"', '안녕하세요'),
        ),
      )
      .toBe(true);

    await page.getByRole('link', { name: '시리즈 목록 보러가기' }).click();
    await expect(page).toHaveURL(/\/series\?showType=carousel$/);
  } finally {
    await context.close();
  }
});

test('존재하지 않는 앱 경로는 404 상태와 안내 화면을 반환한다', async ({ page }) => {
  const response = await page.goto('/e2e-missing-page');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: '404', exact: true })).toBeVisible();
});

test('주입한 사이트 주소를 홈·목록 메타데이터와 사이트맵에 반영한다', async ({ page, request, baseURL }) => {
  for (const [pathname, canonicalPath] of [
    ['/', '/'],
    ['/posts?page=2', '/posts'],
    ['/diary?page=3', '/diary'],
    ['/series?page=2', '/series'],
  ] as const) {
    expect((await page.goto(pathname))?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${baseURL}${canonicalPath}`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${baseURL}${canonicalPath}`);
  }

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]!);
  expect(urls).toContain(`${baseURL}/series`);
  expect(urls.every((url) => new URL(url).origin === baseURL)).toBe(true);
});
