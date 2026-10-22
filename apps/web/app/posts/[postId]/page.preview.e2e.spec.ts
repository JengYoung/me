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
    // 전역 overflow-x: hidden으로 가려지는 본문·목차의 잘림도 확인한다.
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
