import { expect, test } from '@playwright/test';

test('공통 헤더를 표시하고 시스템 테마와 관계없이 라이트 모드로 시작한다', async ({ page }) => {
  await page.goto('/posts');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(254, 254, 254)');
  await expect(page.getByRole('banner').getByRole('link', { name: 'JengYoung 홈' })).toBeVisible();
  await expect(page.getByRole('button', { name: '메뉴 열기' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  const header = await page.getByRole('banner').boundingBox();
  const main = await page.getByRole('main').boundingBox();
  expect(header).not.toBeNull();
  expect(main).not.toBeNull();
  expect(main!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
});

test('사이드바를 키보드로 닫고 메뉴로 이동한 뒤에도 다시 사용할 수 있다', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  if (testInfo.project.use.colorScheme === 'dark') {
    await page.locator('html').evaluate((element) => {
      element.dataset.theme = 'dark';
    });
  }

  const trigger = page.getByRole('button', { name: '메뉴 열기' });
  const dialog = page.getByRole('dialog', { name: '둘러보기' });
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: '홈', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await dialog.getByRole('link', { name: '포스트', exact: true }).click();
  await expect(page).toHaveURL(/\/posts$/);
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();

  await trigger.click();
  await expect(dialog.getByRole('link', { name: '포스트', exact: true })).toHaveAttribute('aria-current', 'page');
  await dialog.getByRole('button', { name: '메뉴 닫기' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.getByRole('main').evaluate((element) => element.closest('[inert]'))).toBeNull();
  expect(errors).toEqual([]);
});
