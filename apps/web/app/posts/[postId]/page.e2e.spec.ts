import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';

// 앱의 생성 카탈로그와 별도로 실제 파일 목록을 읽어 누락·잘못된 공개를 검사한다.
// 원고를 복제하거나 수정하지 않는다.
const postsRoot = path.resolve(import.meta.dirname, '../../../docs/posts');
const directories = await readdir(postsRoot, { withFileTypes: true });
const versionOrder = new Intl.Collator('en', { numeric: true });
const documents = await Promise.all(
  directories
    .filter((entry) => entry.isDirectory())
    .map(async (entry) => {
      const files = await readdir(path.join(postsRoot, entry.name));
      const candidates = files.filter((filename) => /^[1-9]\d*\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.mdx$/.test(filename));
      const releases = [...candidates].sort(versionOrder.compare);
      return { id: entry.name, releases };
    }),
);
const published = documents.filter((document) => document.releases.length > 0);
const drafts = documents.filter((document) => document.releases.length === 0);
const postUrl = (postId: string) => `/posts/${encodeURIComponent(postId)}`;

test('실제 docs의 공개 글만 포스트 목록에 표시한다', async ({ page }) => {
  const response = await page.goto('/posts');
  expect(response?.status()).toBe(200);
  const links = page.getByRole('main').locator('a[href^="/posts/"]');
  await expect(links).toHaveCount(published.length);
  const hrefs = await links.evaluateAll((items) => items.map((item) => item.getAttribute('href')));
  expect(new Set(hrefs)).toEqual(new Set(published.map(({ id }) => postUrl(id))));
  if (published.length === 0) await expect(page.getByText('아직 공개된 글이 없습니다.')).toBeVisible();
});

test('사이트맵에는 실제 공개 글의 기본 주소만 포함한다', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1]!)
    .filter((url) => url.includes('/posts/'));
  expect(new Set(urls)).toEqual(new Set(published.map(({ id }) => `https://jengyoung.co.kr${postUrl(id)}`)));
});

test('실제 초안은 기본 주소와 버전 쿼리로도 공개되지 않는다', async ({ request }) => {
  test.skip(drafts.length === 0, '초안만 있는 글이 없어 비공개 주소를 검사할 대상이 없습니다.');
  for (const { id } of drafts) {
    for (const suffix of ['', '?version=0.0.0']) {
      const pathname = `${postUrl(id)}${suffix}`;
      expect((await request.get(pathname)).status(), pathname).toBe(404);
    }
  }
});

// 공개 버전이 실제로 추가되면 그 문서의 제목·버전·canonical을 그대로 검증한다.
for (const { id, releases } of published) {
  test(`${id}: 실제 공개 원고의 최신·과거 버전을 읽는다`, async ({ page }) => {
    const canonical = `https://jengyoung.co.kr${postUrl(id)}`;
    const latest = releases.at(-1)!;
    for (const filename of [...releases].reverse()) {
      const source = await readFile(path.join(postsRoot, id, filename), 'utf8');
      const frontmatter = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
      expect(frontmatter, `${id}/${filename}의 frontmatter`).not.toBeNull();
      const metadata = parse(frontmatter![1]!);
      const version = filename.slice(0, -4);
      const suffix = filename === latest ? '' : `?version=${version}`;
      const response = await page.goto(`${postUrl(id)}${suffix}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('article')).toHaveAttribute('data-post-version', version);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(metadata.title);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    }
  });
}
