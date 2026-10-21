import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { compile } from '@mdx-js/mdx';
import { expect, onTestFinished, test } from 'vitest';
import remarkArticle from './remark-article.mjs';

async function articleFile(source: string) {
  const root = await mkdtemp(path.join(tmpdir(), 'me-mdx-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, '1.0.0.그림.png'), 'test-image');
  return { path: path.join(root, '1.10.0.mdx'), value: source };
}

test('중복 제목 앵커·목차와 이전 공개 이미지의 동일한 import를 생성한다', async () => {
  const file = await articleFile(
    '## 같은 제목\n\n## 같은 제목\n\n![그림](./1.0.0.그림.png)\n\n<ArticleImage src="./1.0.0.그림.png" alt="같은 그림" pcWidth="1/2" />',
  );
  const output = String(await compile(file, { remarkPlugins: [remarkArticle] }));
  expect(output).toContain('article-같은-제목');
  expect(output).toContain('article-같은-제목-1');
  expect(output).toContain('ArticleTableOfContents');
  expect(output.match(/import _articleImage/g)).toHaveLength(1);
  expect(output).toContain('./1.0.0.그림.png');
  expect(output).not.toContain('./1.10.0.그림.png');
});

test.each([
  '![초안](./0.0.0.그림.png)',
  '<ArticleImage src="./0.3.0.그림.png" alt="초안" />',
  '![누락](./1.0.0.없는.png)',
  '![다른 글](../another/1.0.0.그림.png)',
  'import Draft from "./0.0.0.mdx"\n\n<Draft />',
])('공개할 수 없는 원고·자산 참조를 거부한다: %s', async (source) => {
  await expect(compile(await articleFile(source), { remarkPlugins: [remarkArticle] })).rejects.toThrow();
});

test('일반 Markdown 초안의 기존 이미지는 로컬 미리보기에서만 허용한다', async () => {
  const article = await articleFile('![작성 중인 이미지](./diagram.png)');
  const file = { ...article, path: path.join(path.dirname(article.path), '0.0.0.local.md') };
  await writeFile(path.join(path.dirname(file.path), 'diagram.png'), 'test-image');
  await expect(compile(file, { remarkPlugins: [remarkArticle] })).rejects.toThrow('초안');
  const output = String(await compile(file, { format: 'md', remarkPlugins: [[remarkArticle, { preview: true }]] }));
  expect(output).toContain('./diagram.png');
  expect(output).toContain('ArticleImage');
});

test('미리보기에서도 공개 원고에는 초안 이미지 규칙을 적용하지 않는다', async () => {
  const file = await articleFile('![초안 이미지](./0.0.0.그림.png)');
  await expect(compile(file, { remarkPlugins: [[remarkArticle, { preview: true }]] })).rejects.toThrow();
});
