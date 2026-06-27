import { defineConfig, devices } from '@playwright/test'

/** Config for live-site smoke tests — no local dev server. */
export default defineConfig({
  testMatch: '**/production.spec.js',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
