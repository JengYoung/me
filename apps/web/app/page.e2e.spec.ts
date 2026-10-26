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
  expect(failedResources, '앱 리소스 요청 실패').toEqual([]);
  expect(runtimeErrors, '초기 로딩 중 브라우저 오류').toEqual([]);
});

test('존재하지 않는 앱 경로는 404 상태와 안내 화면을 반환한다', async ({ page }) => {
  const response = await page.goto('/e2e-missing-page');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: '404', exact: true })).toBeVisible();
});
