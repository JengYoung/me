import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';

// 실제 원고를 읽기만 한다. 이관되지 않은 .md는 공개 기록으로 취급하지 않는다.
const root = path.resolve(import.meta.dirname, '../../docs/diary');
const files = await readdir(root, { recursive: true, withFileTypes: true });
const documents = await Promise.all(
  files
    .filter(
      (file) => file.isFile() && file.name.endsWith('.mdx') && /^\d{4}$/.test(path.relative(root, file.parentPath)),
    )
    .map(async (file) => {
      const source = await readFile(path.join(file.parentPath, file.name), 'utf8');
      const data = parse(/^---\r?\n([\s\S]*?)\r?\n---/.exec(source)![1]!);
      return {
        id: file.name.replace(/(?:\.local)?\.mdx$/, ''),
        title: data.title as string,
        isDraft: !data.publishedAt || file.name.includes('.local.'),
      };
    }),
);
const published = documents.filter((document) => !document.isDraft);

test('공통 메뉴에서 일기로 이동하고 현재 경로를 표시한다', async ({ page }) => {
  await page.goto('/posts');
  await page.getByRole('button', { name: '메뉴 열기' }).click();
  const dialog = page.getByRole('dialog', { name: '둘러보기' });
  await dialog.getByRole('link', { name: '일기', exact: true }).click();
  await expect(page).toHaveURL('/diary');
  await expect(dialog).not.toBeVisible();
  await page.getByRole('button', { name: '메뉴 열기' }).click();
  await expect(dialog.getByRole('link', { name: '일기', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('일기 목록은 실제 공개 원고만 표시하고 모바일·테마에서도 읽을 수 있다', async ({ page }, testInfo) => {
  expect((await page.goto('/diary'))?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: '일기', exact: true })).toBeVisible();
  const links = page.getByRole('main').locator('a[href^="/diary/"]');
  await expect(links).toHaveCount(published.length);
  expect(new Set(await links.evaluateAll((items) => items.map((item) => item.getAttribute('href'))))).toEqual(
    new Set(published.map(({ id }) => `/diary/${id}`)),
  );
  if (!published.length) await expect(page.getByText('아직 공개된 일기가 없습니다.')).toBeVisible();
  await page
    .locator('html')
    .evaluate(
      (html, theme) => html.setAttribute('data-theme', theme),
      testInfo.project.name.includes('dark') ? 'dark' : 'light',
    );
  expect(await page.getByRole('main').evaluate((main) => main.scrollWidth <= main.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('diary-list.png'), fullPage: true });
});

test('일기 사이트맵에 공개 원고의 기본 URL만 포함한다', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  const urls = [...(await response.text()).matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1]!)
    .filter((url) => url.includes('/diary/'));
  expect(new Set(urls)).toEqual(new Set(published.map(({ id }) => `https://jengyoung.co.kr/diary/${id}`)));
});

test('초안·기존 Markdown·없는 일기는 직접 주소에서도 비공개다', async ({ request }) => {
  const ids = [
    ...documents.filter((document) => document.isDraft).map(({ id }) => id),
    ...files
      .filter((file) => file.isFile() && file.name.endsWith('.md'))
      .map((file) => file.name.replace(/(?:\.local)?\.md$/, ''))
      .filter((id) => !published.some((entry) => entry.id === id)),
    '__missing-diary__',
  ];
  for (const id of ids) {
    expect((await request.get(`/diary/${id}`)).status()).toBe(404);
    expect((await request.get(`/diary/${id}?version=1.0.0`)).status()).toBe(404);
  }
});

test('일기 상세는 단일 현재 본문만 제공하고 목록으로 복귀한다', async ({ page }) => {
  test.skip(published.length === 0, '실제 공개 일기가 없어 상세 탐색 검증은 실행하지 않습니다.');
  for (const { id, title } of published) {
    await page.goto(`/diary/${id}?version=1.0.0`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.locator('article')).toHaveCount(1);
    await expect(page.locator('[data-post-version]')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: '시리즈 이어 읽기' })).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://jengyoung.co.kr/diary/${id}`);
    await page.getByRole('link', { name: '일기 목록 보러가기' }).click();
    await expect(page).toHaveURL('/diary');
  }
});
