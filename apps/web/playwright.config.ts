import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:3100';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.e2e.spec.ts',
  testIgnore: '**/*.preview.e2e.spec.ts',
  respectGitIgnore: true,
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: './test-results/e2e',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop-dark',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, colorScheme: 'dark' },
    },
    {
      name: 'chromium-mobile-light',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, colorScheme: 'light' },
    },
  ],
  webServer: {
    env: {
      BLOG_NEXT_DIST_DIR: '.next-e2e',
    },
    command: 'pnpm run build && pnpm exec next start --hostname 127.0.0.1 --port 3100',
    url: baseURL,
    // 다른 개발 서버나 오래된 빌드에 연결하지 않고 이번 실행의 앱을 검증한다.
    reuseExistingServer: false,
    timeout: 120_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
