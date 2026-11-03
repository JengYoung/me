import { readFile } from 'node:fs/promises';
import { compile } from '@mdx-js/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { loadDiary, parseDiaryMetadata } from '../../entities/diary/api/load-diary.ts';
import remarkArticle from '../mdx/remark-article.mjs';
import { docsRoot } from './source.ts';

export async function validateDiaryFile(filename: string, source: string) {
  const entry = parseDiaryMetadata(source, filename);
  await compile(
    { path: filename, value: source },
    {
      remarkPlugins: [remarkFrontmatter, remarkGfm, [remarkArticle, { preview: !!entry.isDraft }]],
    },
  );
  return entry;
}

export async function validateDiary({ contentRoot = docsRoot, drafts = false } = {}) {
  const documents = await loadDiary(contentRoot, { includeDrafts: drafts });
  for (const { sourcePath } of documents) await validateDiaryFile(sourcePath, await readFile(sourcePath, 'utf8'));
  return {
    published: documents.filter(({ entry }) => !entry.isDraft).length,
    drafts: documents.filter(({ entry }) => entry.isDraft).length,
  };
}
