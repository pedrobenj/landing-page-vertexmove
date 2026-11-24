import { expect, type Page, test } from "@playwright/test"

export const ADMIN_EMAIL = "admin@example.com"
export const OPERATOR_EMAIL = "operador@example.com"
export const ADMIN_PASSWORD = "Vertex@Dev12345"

/** `true` quando a suíte roda contra o backend real (`playwright.real.config.ts`). */
export const IS_REAL_API = process.env.E2E_TARGET === "real"

interface AdminCredentials {
  email: string
  password: string
}

/**
 * Credenciais do admin. No mock, as contas de desenvolvimento do seed. Contra o backend real, SÓ das
 * variáveis `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` (nunca de arquivos `.env`); sem elas o teste é pulado.
 * Chamar dentro do corpo do teste.
 */
export function adminCredentials(): AdminCredentials {
  if (!IS_REAL_API) return { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
  const email = process.env.E2E_ADMIN_EMAIL ?? ""
  const password = process.env.E2E_ADMIN_PASSWORD ?? ""
  test.skip(!email || !password, "Defina E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD para rodar os specs admin contra o backend real.")
  return { email, password }
}

/** Preenche e envia o login (sem esperar o resultado). */
export async function submitAdminLogin(page: Page, email: string, password: string) {
  await page.goto("/admin/login")
  // "Entrar" só habilita depois da hidratação: preencher antes disso perde o que foi digitado.
  await expect(page.getByRole("button", { name: "Entrar" })).toBeEnabled({ timeout: 30_000 })
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel("Senha").fill(password)
  await page.getByRole("button", { name: "Entrar" }).click()
}

/**
 * Entra no admin e espera o dashboard. Só com a senha certa: o mock e o backend bloqueiam após 5 erros.
 * Sem `email`, usa `adminCredentials()` (e pula o teste no backend real sem as variáveis).
 */
export async function loginAsAdmin(page: Page, email?: string) {
  const credentials = email ? { email, password: ADMIN_PASSWORD } : adminCredentials()
  await submitAdminLogin(page, credentials.email, credentials.password)
  await expect(page).toHaveURL("/admin", { timeout: 20_000 })
}
