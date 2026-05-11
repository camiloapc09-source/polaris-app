import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,
  expect: { timeout: 8_000 },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },

  projects: [
    // ── Setup: authenticate each role once ──────────────────────────────
    { name: 'setup-admin',    testMatch: /auth\/setup\.admin\.ts/ },
    { name: 'setup-client',   testMatch: /auth\/setup\.client\.ts/ },
    { name: 'setup-employee', testMatch: /auth\/setup\.employee\.ts/ },

    // ── Public (no auth) ─────────────────────────────────────────────────
    {
      name: 'public',
      testMatch: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // ── Admin ─────────────────────────────────────────────────────────────
    {
      name: 'admin',
      testMatch: /admin\/.+\.spec\.ts/,
      dependencies: ['setup-admin'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
    },

    // ── Client ────────────────────────────────────────────────────────────
    {
      name: 'client',
      testMatch: /client\/.+\.spec\.ts/,
      dependencies: ['setup-client'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/client.json',
      },
    },

    // ── Employee ──────────────────────────────────────────────────────────
    {
      name: 'employee',
      testMatch: /employee\/.+\.spec\.ts/,
      dependencies: ['setup-employee'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/employee.json',
      },
    },
  ],
})
