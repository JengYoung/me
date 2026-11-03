import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';

const root = path.resolve(import.meta.dirname, '../../docs/diary');
const files = await readdir(root, { recursive: true, withFileTypes: true });
const documents = await Promise.all(
  files
    .filter(
      (file) => file.isFile() && file.name.endsWith('.mdx') && /^\d{4}$/.test(path.relative(root, file.parentPath)),
    )
    .map(async (file) => {
      const source = await readFile(path.join(file.parentPath, file.name), 'utf8');
      const metadata = parse(/^---\r?\n([\s\S]*?)\r?\n---/.exec(source)![1]!);
      return {
        id: file.name.replace(/(?:\.local)?\.mdx$/, ''),
        title: metadata.title as string,
        entryDate: metadata.entryDate as string,
        isDraft: !metadata.publishedAt || file.name.includes('.local.'),
      };
    }),
);

test('일기 개발 경로는 실제 원고 목록을 제공하고 검색에서 제외한다', async ({ page, request }) => {
  const response = await page.goto('/diary');
  expect(response?.status()).toBe(200);
  expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
  await expect(page.getByRole('heading', { name: '일기', level: 1, exact: true })).toBeVisible();
  await expect(page.getByRole('main').locator('a[href^="/diary/"]')).toHaveCount(documents.length);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const entry of documents) {
    await expect(page.getByRole('main').getByRole('link', { name: entry.title, exact: false })).toBeVisible();
    if (entry.isDraft) expect(sitemap).not.toContain(`/diary/${entry.id}`);
  }
});

for (const entry of documents) {
  test(`${entry.id}: 목록에서 실제 일기 본문을 열고 돌아온다`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/diary');
    await page.getByRole('main').getByRole('link', { name: entry.title, exact: false }).click();
    await expect(page).toHaveURL(`/diary/${entry.id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(entry.title);
    await expect(page.locator('article time')).toHaveAttribute('datetime', entry.entryDate);
    await expect(page.locator('[data-article-prose]')).not.toHaveText('');
    await expect(page.locator('[data-post-version]')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: '시리즈 이어 읽기' })).toHaveCount(0);
    if (entry.isDraft) {
      await expect(page.getByText('로컬 초안 미리보기', { exact: true })).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
    }
    for (const img of await page.locator('article img').all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`diary-${entry.id}.png`), fullPage: true });
    await page.getByRole('link', { name: '일기 목록 보러가기' }).click();
    await expect(page).toHaveURL('/diary');
    expect(errors).toEqual([]);
  });
}
