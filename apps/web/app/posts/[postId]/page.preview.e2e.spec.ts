import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';

const postsRoot = path.resolve(import.meta.dirname, '../../../docs/posts');
const directories = await readdir(postsRoot, { withFileTypes: true });
const versionOrder = new Intl.Collator('en', { numeric: true });
const documents = (
  await Promise.all(
    directories
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const files = await readdir(path.join(postsRoot, entry.name));
        const drafts = files.filter((name) => /^0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:\.local)?\.mdx?$/.test(name));
        const published = files.filter((name) => /^[1-9]\d*\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.mdx$/.test(name));
        const filename = [...(drafts.length ? drafts : published)].sort(versionOrder.compare).at(-1);
        if (!filename) return [];
        const source = await readFile(path.join(postsRoot, entry.name, filename), 'utf8');
        const frontmatter = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
        if (!frontmatter) throw new Error(`${entry.name}/${filename}: frontmatter가 필요합니다.`);
        const { title } = parse(frontmatter[1]!);
        return [
          {
            sourceLength: source.length,
            latest: {
              post: {
                id: entry.name,
                title: String(title),
                version: filename.split('.').slice(0, 3).join('.'),
                isDraft: drafts.length > 0,
              },
            },
          },
        ];
      }),
  )
).flat();

test('스크롤 중에도 목차를 열고 가려지지 않는 본문 제목으로 이동한다', async ({ page }, testInfo) => {
  const document = documents.reduce<(typeof documents)[number] | undefined>(
    (longest, current) => (!longest || current.sourceLength > longest.sourceLength ? current : longest),
    undefined,
  );
  test.skip(!document, '미리볼 실제 원고가 없습니다.');
  await page.goto(`/posts/${encodeURIComponent(document!.latest.post.id)}`);
  if (testInfo.project.use.colorScheme === 'dark') {
    await page.locator('html').evaluate((element) => {
      element.dataset.theme = 'dark';
    });
  }
  const desktop = page.viewportSize()!.width >= 1200;
  const toc = page.locator('[data-article-toc]');
  const header = page.getByRole('banner');
  // 메뉴를 실제로 조작해 hydration을 확인하고, 헤더 밖에 포커스를 둔 채 읽기를 시작한다.
  await page.getByRole('button', { name: '메뉴 열기' }).click();
  const menu = page.getByRole('dialog', { name: '둘러보기' });
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
  await page.getByRole('main').focus();
  await page.locator('[data-article-prose]').evaluate((element) => {
    window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY + window.innerHeight);
  });
  const stickyTop = await toc.evaluate((element) => parseFloat(getComputedStyle(element).top));
  await expect.poll(async () => Math.round((await toc.boundingBox())!.y)).toBe(stickyTop);
  await expect
    .poll(async () => {
      const bounds = (await header.boundingBox())!;
      return Math.round(bounds.y + bounds.height);
    })
    .toBeLessThanOrEqual(0);

  await page.evaluate(() => window.scrollBy(0, -200));
  await expect.poll(async () => Math.round((await header.boundingBox())!.y)).toBe(0);
  await expect.poll(async () => Math.round((await toc.boundingBox())!.y)).toBe(stickyTop);

  if (!desktop) {
    const readingPosition = await page.evaluate(() => window.scrollY);
    await toc.locator('summary').click();
    await expect(toc.locator('details')).toHaveAttribute('open');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(readingPosition);
  }
  const navigation = toc.locator('nav:visible');
  const link = navigation.getByRole('link').nth(2);
  const href = await link.getAttribute('href');
  expect(href).toMatch(/^#/);
  await link.click();
  if (!desktop) await expect(toc.locator('details')).not.toHaveAttribute('open');
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(href);
  const heading = page.locator(`[id=${JSON.stringify(decodeURIComponent(href!.slice(1)))}]`);
  await expect(heading).toBeFocused();
  const bounds = (await heading.boundingBox())!;
  const obstruction = desktop
    ? (await header.boundingBox())!.height
    : (await toc.boundingBox())!.y + (await toc.boundingBox())!.height;
  expect(bounds.y).toBeGreaterThanOrEqual(obstruction);
  expect(bounds.y).toBeLessThan(page.viewportSize()!.height);
});

test('실제 원고 목록에서 초안을 열 수 있고 초안은 사이트맵에 없다', async ({ page, request }) => {
  await page.goto('/posts');
  await expect(page.getByRole('main').locator('a[href^="/posts/"]')).toHaveCount(documents.length);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const {
    latest: { post },
  } of documents) {
    if (post.isDraft) expect(sitemap).not.toContain(`/posts/${post.id}<`);
    await expect(
      page.getByRole('link', { name: new RegExp(post.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }),
    ).toBeVisible();
  }
});

for (const {
  latest: { post },
} of documents) {
  test(`${post.id}: 실제 제목·본문·이미지를 렌더링한다`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(`/posts/${encodeURIComponent(post.id)}`);
    expect(response?.status()).toBe(200);
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(post.title);
    await expect(page.locator('article')).toHaveAttribute('data-post-version', post.version);
    await expect(page.locator('[data-article-prose]')).not.toHaveText('');
    // 가로 넘침을 숨기는 전역 스타일로 본문·목차가 잘리지 않는지도 확인한다.
    for (const element of await page.locator('[data-article-prose], [data-article-toc]').all()) {
      const bounds = await element.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    }
    if (post.isDraft) {
      await expect(page.getByText(`로컬 초안 미리보기 · v${post.version}`)).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
    }
    for (const img of await page.locator('article img').all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
