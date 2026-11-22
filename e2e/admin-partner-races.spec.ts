import { expect, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/admin-login"
import { MOCK_ONLY } from "./helpers/mock-only"
import { uniqueSuffix } from "./helpers/unique-suffix"

const LIST_URL = "/admin/corridas-parceiras"
// Primeira compilação de cada rota no `next dev` passa dos 5 s padrão.
const NAVIGATION = { timeout: 30_000 }

test.describe("Admin — corridas parceiras", () => {
  test.describe.configure({ timeout: 90_000 })

  test("menu leva à lista com as corridas do seed", MOCK_ONLY, async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole("navigation", { name: "Menu do admin" }).getByRole("link", { name: "Corridas parceiras" }).click()
    await expect(page).toHaveURL(LIST_URL, NAVIGATION)
    await expect(page.getByRole("heading", { level: 1, name: "Corridas parceiras" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Corrida da Lagoa de Messejana" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Desativar Corrida da Lagoa de Messejana" })).toBeVisible()
  })

  test("cadastra, edita, desativa, reativa e exclui; o site acompanha", async ({ page }) => {
    test.slow()
    const name = `Parceira E2E ${uniqueSuffix()}`
    const coupon = `E2E${uniqueSuffix().slice(-6).toUpperCase()}`
    const publicCard = () => page.getByRole("main").getByRole("article").filter({ hasText: name })

    await loginAsAdmin(page)
    await page.goto(LIST_URL)
    await page.getByRole("link", { name: "Nova corrida parceira" }).click()
    await expect(page.getByRole("heading", { level: 1, name: "Nova corrida parceira" })).toBeVisible(NAVIGATION)

    await page.getByLabel("Nome da corrida").fill(name)
    await page.getByLabel("Data", { exact: true }).fill("2027-06-20")
    await page.getByLabel("Distâncias").fill("5 km, 10 km")
    await page.getByLabel("Local", { exact: true }).fill("Farol do Mucuripe")
    await page.getByLabel("Cupom", { exact: true }).fill(coupon)
    await page.getByLabel("Desconto (%)").fill("15")
    await page.getByLabel("Link de inscrição").fill("https://example.com/parceira-e2e")
    await page.getByRole("button", { name: "Salvar corrida parceira" }).click()

    await expect(page).toHaveURL(LIST_URL, { timeout: 30_000 })
    const row = page.getByRole("row").filter({ hasText: name })
    await expect(row.getByText(`${coupon}`)).toBeVisible()
    await expect(row.getByText("Ativa", { exact: true })).toBeVisible()

    // A action invalida a tag `partner-races`: o site já mostra a corrida nova.
    await page.goto("/corridas-parceiras")
    await expect(publicCard().getByText(coupon, { exact: true })).toBeVisible(NAVIGATION)
    await expect(publicCard().getByText("15% de desconto")).toBeVisible()

    // Edição pelo formulário.
    await page.goto(LIST_URL)
    await page.getByRole("link", { name }).click()
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible(NAVIGATION)
    await expect(page.getByLabel("Distâncias")).toHaveValue("5 km, 10 km")
    await page.getByLabel("Desconto (%)").fill("20")
    await page.getByRole("button", { name: "Salvar corrida parceira" }).click()
    await expect(page).toHaveURL(LIST_URL, { timeout: 30_000 })
    await expect(row.getByText("20%")).toBeVisible()

    // Desativar na lista: some do site.
    await row.getByRole("button", { name: `Desativar ${name}` }).click()
    await expect(row.getByText("Inativa", { exact: true })).toBeVisible({ timeout: 15_000 })
    await page.goto("/corridas-parceiras")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(publicCard()).toHaveCount(0)

    await page.goto(LIST_URL)
    await row.getByRole("button", { name: `Ativar ${name}` }).click()
    await expect(row.getByText("Ativa", { exact: true })).toBeVisible({ timeout: 15_000 })

    // Exclusão com confirmação (limpa o que o teste criou).
    await page.getByRole("link", { name }).click()
    await page.getByRole("button", { name: "Excluir corrida parceira" }).click()
    await expect(page.getByRole("heading", { name: "Excluir esta corrida parceira?" })).toBeVisible(NAVIGATION)
    await page.getByRole("button", { name: "Excluir", exact: true }).click()
    await expect(page).toHaveURL(LIST_URL, { timeout: 30_000 })
    await expect(page.getByRole("link", { name })).toHaveCount(0)
  })

  test("valida o formulário em português (link só https)", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto(`${LIST_URL}/nova`)
    await expect(page.getByRole("heading", { level: 1, name: "Nova corrida parceira" })).toBeVisible(NAVIGATION)
    await page.getByLabel("Link de inscrição").fill("http://example.com")
    await page.getByLabel("Desconto (%)").fill("0")
    await page.getByRole("button", { name: "Salvar corrida parceira" }).click()

    await expect(page.getByText("Informe o nome da corrida")).toBeVisible()
    await expect(page.getByText("Informe a data da corrida")).toBeVisible()
    await expect(page.getByText("Desconto entre 1% e 100%")).toBeVisible()
    await expect(page.getByText("Informe um link https://")).toBeVisible()
  })

  test("id inexistente ou inválido responde 404", async ({ page }) => {
    test.slow()
    await loginAsAdmin(page)
    expect((await page.goto(`${LIST_URL}/999999`))?.status()).toBe(404)
    expect((await page.goto(`${LIST_URL}/abc`))?.status()).toBe(404)
  })
})
