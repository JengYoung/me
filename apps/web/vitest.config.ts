import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';
import svgrOptions from './svgr.config.js';

export default defineConfig({
  plugins: [svgr({ svgrOptions }), react(), tailwindcss()],
  // globals.css가 상대 경로로 가져오는 로컬 폰트도 Vite 소스로 처리한다.
  publicDir: false,
  // 앱 CSS를 그대로 사용하되 Next.js의 PostCSS 처리를 중복 실행하지 않는다.
  css: { postcss: { plugins: [] } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['shared/**/*.ssr.test.tsx'],
        },
      },
      {
        extends: true,
        test: {
          include: ['shared/**/*.browser.test.tsx'],
          setupFiles: ['./vitest.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            screenshotDirectory: './test-results/screenshots',
            instances: [
              {
                name: 'chromium-mobile-light',
                browser: 'chromium',
                viewport: { width: 390, height: 844 },
                provider: playwright({ contextOptions: { colorScheme: 'light', reducedMotion: 'reduce' } }),
              },
              {
                name: 'chromium-desktop-dark',
                browser: 'chromium',
                viewport: { width: 1440, height: 900 },
                provider: playwright({ contextOptions: { colorScheme: 'dark', reducedMotion: 'reduce' } }),
              },
            ],
          },
        },
      },
    ],
  },
});
