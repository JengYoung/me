import { execFile } from 'node:child_process';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { compile } from '@mdx-js/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkArticle from '../mdx/remark-article.mjs';
import { loadPosts, parsePostMetadata } from '../../entities/post/api/load-posts.ts';
import { docsRoot } from './post-source.ts';

const execute = promisify(execFile);

export async function validatePostFile(filename: string, source: string, draft = false) {
  parsePostMetadata(source, filename, draft);
  await compile(
    { path: filename, value: source },
    {
      format: filename.endsWith('.md') ? 'md' : 'mdx',
      remarkPlugins: [remarkFrontmatter, remarkGfm, [remarkArticle, { preview: draft }]],
    },
  );
}

/** 별도 공개 목록 없이 Git HEAD의 공개 파일과 자산 보존 여부만 검사한다. */
export async function validatePublishedHistory(contentRoot = docsRoot) {
  let repository: string;
  try {
    repository = (await execute('git', ['rev-parse', '--show-toplevel'], { cwd: contentRoot })).stdout.trim();
    await execute('git', ['rev-parse', '--verify', 'HEAD'], { cwd: repository });
  } catch (error) {
    if ((error as { code?: unknown }).code === 128) return 0;
    throw error;
  }
  const prefix = path
    .relative(repository, await realpath(path.join(contentRoot, 'posts')))
    .split(path.sep)
    .join('/');
  const { stdout } = await execute('git', ['ls-tree', '-rz', '--name-only', 'HEAD', '--', prefix], { cwd: repository });
  let checked = 0;
  for (const filename of stdout.split('\0').filter(Boolean)) {
    const relative = filename.slice(prefix.length + 1);
    if (
      !/^[^/]+\/[1-9]\d*\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:\.mdx|\.[^/]+\.(?:png|jpe?g|webp|avif|gif))$/i.test(relative)
    )
      continue;
    const original = (
      await execute('git', ['show', `HEAD:${filename}`], {
        cwd: repository,
        encoding: 'buffer',
        maxBuffer: 32 * 1024 * 1024,
      })
    ).stdout;
    const current = await readFile(path.join(repository, filename)).catch(() => undefined);
    if (!current?.equals(original))
      throw new Error(
        `기존 공개 파일이 변경되거나 삭제되었습니다: ${filename}\n기존 파일을 보존하고 새 버전으로 작성하세요.`,
      );
    checked++;
  }
  return checked;
}

export async function validatePosts({ contentRoot = docsRoot, drafts = false } = {}) {
  const history = await validatePublishedHistory(contentRoot);
  const entries = await loadPosts(contentRoot, { includeDrafts: drafts });
  let published = 0;
  let draftCount = 0;
  for (const entry of entries) {
    for (const release of entry.releases) {
      await validatePostFile(release.sourcePath, await readFile(release.sourcePath, 'utf8'));
      published++;
    }
    if (drafts && entry.latest.post.isDraft) {
      await validatePostFile(entry.latest.sourcePath, await readFile(entry.latest.sourcePath, 'utf8'), true);
      draftCount++;
    }
  }
  return { posts: entries.length, published, drafts: draftCount, history };
}
