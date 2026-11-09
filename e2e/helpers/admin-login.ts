import { expect, type Page } from "@playwright/test"

export const ADMIN_EMAIL = "admin@example.com"
export const OPERATOR_EMAIL = "operador@example.com"
export const ADMIN_PASSWORD = "Vertex@Dev12345"

/** Entra no admin e espera o dashboard. Só com a senha certa: o mock bloqueia após 5 erros. */
export async function loginAsAdmin(page: Page, email = ADMIN_EMAIL) {
  await page.goto("/admin/login")
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel("Senha").fill(ADMIN_PASSWORD)
  await page.getByRole("button", { name: "Entrar" }).click()
  await expect(page).toHaveURL("/admin", { timeout: 20_000 })
}
