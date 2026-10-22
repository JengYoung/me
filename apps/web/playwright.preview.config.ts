import { defineConfig } from '@playwright/test';
import config from './playwright.config';

const baseURL = 'http://127.0.0.1:3102';

export default defineConfig({
  ...config,
  testMatch: '**/*.preview.e2e.spec.ts',
  testIgnore: [],
  use: { ...config.use, baseURL },
  webServer: {
    command: 'pnpm dev --port 3102',
    url: `${baseURL}/posts`,
    reuseExistingServer: false,
    timeout: 120_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 10_000 },
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
