import { expect, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/admin-login"

test.describe("Admin da loja", () => {
  // Login + action + navegação somam mais que os 30s padrão no dev server (o beforeEach conta no limite).
  test.describe.configure({ timeout: 60_000 })

  // Login no mock da API VertexMove (admin@example.com); a loja do admin usa o backend falso da loja.
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test("lista os produtos, inclusive inativos", async ({ page }) => {
    await page.goto("/admin/loja/produtos")
    await expect(page.getByRole("link", { name: "Novo produto" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Camisa Edição Limitada 2024" })).toBeVisible()
    await expect(page.getByRole("row").filter({ hasText: "Camisa Edição Limitada 2024" })).toContainText("Inativo")
  })

  test("cadastra um produto que aparece na loja", async ({ page }, testInfo) => {
    // Nome único por projeto/execução: o catálogo mock é compartilhado pelo dev server.
    const name = `Camisa E2E ${testInfo.project.name} ${Date.now()}`
    await page.goto("/admin/loja/produtos/novo")
    await page.getByLabel("Nome").fill(name)
    await page.getByLabel("Nome").blur()
    await page.getByLabel("Preço (R$)").fill("49,90")
    await page.getByLabel("Descrição").fill("Camisa criada pelo teste automatizado.")
    await page.getByLabel("Local e horário de retirada").fill("Retirada na sede")
    await page.getByLabel("Estoque").first().fill("5")
    await page.getByRole("button", { name: "Salvar produto" }).click()

    // A action revalida as páginas da loja; no dev server isso recompila rotas e pode passar de 5s.
    await expect(page).toHaveURL("/admin/loja/produtos", { timeout: 20_000 })
    await expect(page.getByRole("link", { name })).toBeVisible()
    await page.goto("/loja")
    await expect(page.getByText(name)).toBeVisible()
  })

  test("valida o formulário de produto em português", async ({ page }) => {
    await page.goto("/admin/loja/produtos/novo")
    await page.getByRole("button", { name: "Salvar produto" }).click()
    await expect(page.getByText("Informe o nome do produto")).toBeVisible()
    await expect(page.getByText("Informe um preço válido, ex: 89,90")).toBeVisible()
    await expect(page).toHaveURL("/admin/loja/produtos/novo")
  })
})
