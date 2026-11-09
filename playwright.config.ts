import { defineConfig, devices } from "@playwright/test"

const PORT = Number(process.env.E2E_PORT ?? 3001)
const BASE_URL = `http://localhost:${PORT}`

/**
 * Testes end-to-end. Rodam contra o servidor de desenvolvimento com USE_MOCK_API=true,
 * então não precisam da API VertexMove de pé. Porta 3001 (a API usa a 3000).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Localmente, 2 workers: com mais, o `next dev` (compilação sob demanda + revalidações da loja)
  // fica lento a ponto de estourar os timeouts em máquinas com pouca memória.
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    locale: "pt-BR",
    timezoneId: "America/Fortaleza",
    // Animações (motion) desligadas por padrão: estado final imediato, testes estáveis.
    // `e2e/motion.spec.ts` liga de volta para conferir as animações.
    contextOptions: { reducedMotion: "reduce" },
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
    env: { USE_MOCK_API: "true" },
  },
})
