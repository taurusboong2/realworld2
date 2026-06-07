import { defineConfig, devices } from '@playwright/test';

const webBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const mockApiBaseUrl =
  process.env.PLAYWRIGHT_MOCK_API_URL ?? 'http://localhost:3101';
const reuseExistingServer = process.env.PLAYWRIGHT_REUSE_SERVER === 'true';

export default defineConfig({
  testDir: './apps/web/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: webBaseUrl,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'corepack pnpm exec tsx apps/web/e2e/mock-api-server.ts',
      url: `${mockApiBaseUrl}/api`,
      reuseExistingServer,
      timeout: 120_000,
    },
    {
      command: `NEST_API_URL=${mockApiBaseUrl} corepack pnpm --filter @repo/web dev`,
      url: webBaseUrl,
      reuseExistingServer,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
