import { defineConfig, devices } from '@playwright/test'

const PORT = 5173
// The showcase (docs site) is a separate app on its own port; a few specs
// exercise it rather than the playground editor.
const SHOWCASE_PORT = 5174
const SHOWCASE_SPECS = /showcase\..*\.spec\.ts/

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: SHOWCASE_SPECS,
    },
    {
      name: 'showcase',
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${SHOWCASE_PORT}` },
      testMatch: SHOWCASE_SPECS,
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter playground dev',
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter showcase dev',
      url: `http://localhost:${SHOWCASE_PORT}`,
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
      timeout: 120_000,
    },
  ],
})
