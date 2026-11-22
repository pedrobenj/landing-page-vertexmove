import { defineConfig } from "@playwright/test"

import baseConfig from "./playwright.config"

/**
 * E2E contra o backend REAL (`plan/02-integracao-real.md`, tarefa 5): o Next sobe com `USE_MOCK_API=false`
 * e `API_URL=http://localhost:3000` (backend de pé com o banco de dev). Porta própria (3106) para nunca
 * reaproveitar um `next dev` com mock.
 *
 * - Testes que dependem do seed do mock têm a tag `@mock` e ficam de fora (`grepInvert`).
 * - Specs só do real ficam em `e2e/real/` (o config do mock os ignora).
 * - Specs admin leem `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` do ambiente e são pulados sem elas.
 *
 * `npm run test:e2e:real`
 */
// Lido pelos helpers (`IS_REAL_API`): o config também é carregado nos workers.
process.env.E2E_TARGET = "real"

const PORT = Number(process.env.E2E_REAL_PORT ?? 3106)
const BASE_URL = `http://localhost:${PORT}`
const API_URL = process.env.E2E_API_URL ?? "http://localhost:3000"

export default defineConfig({
  ...baseConfig,
  testIgnore: [],
  testMatch: [
    "navigation.spec.ts",
    "seo.spec.ts",
    "static-pages.spec.ts",
    "admin.spec.ts",
    "admin-events.spec.ts",
    "admin-partner-races.spec.ts",
    "real/**/*.spec.ts",
  ],
  grepInvert: /@mock/,
  // Banco compartilhado e um único `next dev`: sem paralelismo entre arquivos.
  fullyParallel: false,
  workers: 1,
  use: { ...baseConfig.use, baseURL: BASE_URL },
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { USE_MOCK_API: "false", API_URL },
  },
})
