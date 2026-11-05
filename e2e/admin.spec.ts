import { expect, test } from "@playwright/test"

test.describe("Área do admin", () => {
  test("redireciona para o login quando não há sessão", async ({ page }) => {
    await page.goto("/admin")
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.getByText("Área do organizador")).toBeVisible()
  })

  test("protege as subrotas do admin", async ({ page }) => {
    await page.goto("/admin/eventos")
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("valida o formulário de login em português", async ({ page }) => {
    await page.goto("/admin/login")
    await page.getByLabel("E-mail").fill("email-invalido")
    await page.getByLabel("Senha").fill("123")
    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(page.getByText("E-mail inválido")).toBeVisible()
    await expect(page.getByText("A senha deve ter pelo menos 8 caracteres")).toBeVisible()
  })

  test("não é indexado por buscadores", async ({ page }) => {
    await page.goto("/admin/login")
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/)
  })
})
