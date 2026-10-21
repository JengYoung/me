import svgrOptions from './svgr.config.js';
import { fileURLToPath } from 'node:url';
import createMDX from '@next/mdx';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  distDir: process.env.BLOG_NEXT_DIST_DIR ?? '.next',
  turbopack: {
    rules: {
      '*.svg': {
        condition: { all: [{ not: 'foreign' }, { query: '?react' }] },
        // JSX 변환은 Next.js에 맡겨 공통 automatic runtime 설정을 유지합니다.
        loaders: [{ loader: '@svgr/webpack', options: { ...svgrOptions, babel: false } }],
        as: '*.js',
      },
    },
  },
};

export default function config(phase) {
  const preview = process.env.BLOG_CONTENT_PREVIEW === '1';
  if (preview && phase !== PHASE_DEVELOPMENT_SERVER) {
    throw new Error('초안 미리보기는 dev 개발 서버에서만 실행할 수 있습니다.');
  }
  const generatedRoot = fileURLToPath(
    new URL(`./screens/posts/${preview ? 'generated-preview' : 'generated'}`, import.meta.url),
  );
  const withMDX = createMDX({
    extension: /\.mdx?$/,
    options: {
      remarkPlugins: [
        'remark-frontmatter',
        'remark-gfm',
        [fileURLToPath(new URL('./scripts/mdx/remark-article.mjs', import.meta.url)), { preview }],
      ],
      rehypePlugins: [fileURLToPath(new URL('./scripts/mdx/rehype-article-code.mjs', import.meta.url))],
    },
  });
  return withMDX({
    ...nextConfig,
    turbopack: {
      ...nextConfig.turbopack,
      resolveAlias: { '@post-content/*': `./screens/posts/${preview ? 'generated-preview' : 'generated'}/*` },
    },
    webpack(config) {
      config.resolve.alias['@post-content'] = generatedRoot;
      return config;
    },
    ...(preview
      ? { headers: async () => [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }] }
      : {}),
  });
}
