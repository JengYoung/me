import type { StorybookConfig } from '@storybook/nextjs-vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import svgrOptions from '../svgr.config.js';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import { rehypeArticleCode } from '../shared/lib/mdx/index.ts';

const config: StorybookConfig = {
  stories: ['../{app,shared,entities,features,widgets,screens}/**/*.stories.@(ts|tsx)'],
  staticDirs: ['../public'],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [
        // 문서 UI용 .mdx와 구분해 아티클 예시 Markdown을 실제 빌드 파이프라인으로 렌더링한다.
        mdx({
          include: /\/shared\/ui\/article\/.*\.example\.md$/,
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeArticleCode],
        }),
        svgr({ svgrOptions }),
        tailwindcss(),
      ],
      // Vite가 폰트 URL을 처리하도록 하고 Next.js용 PostCSS의 중복 실행을 막습니다.
      css: { postcss: { plugins: [] } },
    }),
};

export default config;
