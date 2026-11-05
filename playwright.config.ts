import { defineConfig, devices } from "@playwright/test"

const PORT = Number(process.env.E2E_PORT ?? 3000)
const BASE_URL = `http://localhost:${PORT}`

/**
 * Testes end-to-end. Rodam contra o servidor de desenvolvimento com USE_MOCK_DATA=true,
 * então não precisam de banco de dados.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    locale: "pt-BR",
    timezoneId: "America/Fortaleza",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // Mobile-first: largura mínima exigida no CLAUDE.md (360px).
    {
      name: "mobile",
      use: { ...devices["Pixel 5"], viewport: { width: 360, height: 780 } },
    },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      USE_MOCK_DATA: "true",
      DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://e2e:e2e@localhost:5432/e2e",
      AUTH_SECRET: process.env.AUTH_SECRET ?? "e2e-secret-e2e-secret-e2e-secret-123",
    },
  },
})
