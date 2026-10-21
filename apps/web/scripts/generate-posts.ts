import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPosts } from '../entities/post/api/load-posts.ts';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const header = '// generate-posts.ts가 생성합니다. 직접 수정하지 마세요.\n';

function importPath(from: string, target: string) {
  const relative = path.relative(path.dirname(from), target).split(path.sep).join('/');
  return relative.startsWith('.') ? relative : `./${relative}`;
}

export async function generatePosts({
  contentRoot = path.join(appRoot, 'docs'),
  outputRoot = path.join(appRoot, 'screens/posts/generated'),
  includeDrafts = false,
} = {}) {
  if (includeDrafts && process.env.NODE_ENV === 'production') {
    throw new Error('초안 미리보기는 개발 서버에서만 실행할 수 있습니다.');
  }
  const posts = await loadPosts(contentRoot, { includeDrafts });
  const files = new Map<string, string>();
  const imports: string[] = [];
  const entries: string[] = [];
  const archives: string[] = [];

  for (const [index, { latest, releases, revisions }] of posts.entries()) {
    imports.push(
      `import Content${index} from ${JSON.stringify(importPath(path.join(outputRoot, 'current.generated.ts'), latest.sourcePath))};`,
    );
    entries.push(
      `[${JSON.stringify(latest.post.id)}, { post: ${JSON.stringify(latest.post)}, revisions: ${JSON.stringify(revisions)}, Content: Content${index} }]`,
    );
    const loaders: string[] = [];
    for (const { post, sourcePath } of releases) {
      if (latest.post.isDraft || post.version === latest.post.version) continue;
      const filename = `archives/${post.id}/${post.version}.generated.tsx`;
      files.set(
        filename,
        `${header}import Content from ${JSON.stringify(importPath(path.join(outputRoot, filename), sourcePath))};
import { PostArticle } from '../../../ui/post-article';
export default function ArchivedPost() {
  return <PostArticle post={${JSON.stringify(post)}}><Content /></PostArticle>;
}
`,
      );
      loaders.push(
        `[${JSON.stringify(post.version)}, dynamic(() => import(${JSON.stringify(`./${filename.slice(0, -4)}`)}), { ssr: false, loading: ArchiveLoading })]`,
      );
    }
    archives.push(`[${JSON.stringify(latest.post.id)}, new Map<string, ComponentType>([${loaders.join(',\n')}])]`);
  }
  files.set(
    'current.generated.ts',
    `${header}import type { CurrentPost } from '../model/current-post';
${imports.join('\n')}
export const currentPosts = new Map<string, CurrentPost>([${entries.join(',\n')}]);
`,
  );
  files.set(
    'catalog.generated.ts',
    `${header}import type { Post } from '../../../entities/post';
export const posts: readonly Post[] = ${JSON.stringify(posts.map(({ latest }) => latest.post))};
`,
  );
  files.set(
    'archives.generated.ts',
    `${header}'use client';
${archives.some((_, index) => posts[index]!.releases.length > 1) ? "import dynamic from 'next/dynamic';\nimport { ArchiveLoading } from '../ui/archive-loading';" : ''}
import type { ComponentType } from 'react';
export const archiveComponents = new Map<string, ReadonlyMap<string, ComponentType>>([${archives.join(',\n')}]);
`,
  );
  await mkdir(outputRoot, { recursive: true });
  const previous = await readdir(outputRoot, { recursive: true });
  for (const [name, source] of files) {
    const filename = path.join(outputRoot, name);
    await mkdir(path.dirname(filename), { recursive: true });
    const old = await readFile(filename, 'utf8').catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
      return undefined;
    });
    if (old !== source) await writeFile(filename, source);
  }
  // 이 생성기가 소유한 파일만 정리한다. 원고·자산은 읽기 전용이다.
  for (const filename of previous) {
    if (/\.generated\.tsx?$/.test(filename) && !files.has(filename.split(path.sep).join('/'))) {
      await unlink(path.join(outputRoot, filename));
    }
  }
  return {
    posts: posts.length,
    drafts: posts.filter(({ latest }) => latest.post.isDraft).length,
    archives: posts.reduce(
      (count, post) => count + (post.latest.post.isDraft ? 0 : Math.max(0, post.releases.length - 1)),
      0,
    ),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(await generatePosts());
}
