import { expect, test } from '@playwright/test';

for (const { pathname, label } of [
  { pathname: '/posts', label: 'Posts' },
  { pathname: '/diary', label: 'Diary' },
  { pathname: '/series', label: 'Series' },
]) {
  test(`${pathname}의 문서·공유 제목은 URL의 페이지 번호를 따른다`, async ({ page }) => {
    for (const { query, currentPage } of [
      { query: '?page=2', currentPage: 2 },
      { query: '?page=5', currentPage: 5 },
      { query: '?page=0', currentPage: 1 },
      { query: '', currentPage: 1 },
    ]) {
      await page.goto(`${pathname}${query}`);
      const title = `${label} — ${currentPage}페이지 | JengYoung`;
      await expect(page).toHaveTitle(title);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
      if (pathname === '/posts') {
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
          'content',
          new RegExp(`${currentPage}페이지`),
        );
      }
    }
  });
}
