import { expect, test } from "@playwright/test"

import { loginAsAdmin, OPERATOR_EMAIL } from "./helpers/admin-login"
import { uniqueSuffix } from "./helpers/unique-suffix"

/** Corrida em rascunho do seed do mock. */
const DRAFT_EVENT_PATH = "/admin/eventos/4/distancias"

test.describe("Admin — distâncias e lotes", () => {
  test.describe.configure({ timeout: 60_000 })

  test("cria uma distância e um lote na corrida em rascunho", async ({ page }) => {
    test.slow()
    const nome = `E2E ${uniqueSuffix()}`

    await loginAsAdmin(page)
    await page.goto(DRAFT_EVENT_PATH)
    await expect(page.getByRole("heading", { level: 1, name: "Distâncias e lotes" })).toBeVisible()

    await page.getByRole("button", { name: "Nova distância" }).click()
    const distanceDialog = page.getByRole("dialog", { name: "Nova distância" })
    await distanceDialog.getByLabel("Nome", { exact: true }).fill(nome)
    await distanceDialog.getByLabel("Distância (metros)").fill("7000")
    await distanceDialog.getByLabel("Vagas").fill("150")
    await distanceDialog.getByRole("button", { name: "Salvar distância" }).click()

    const card = page.getByRole("article", { name: nome })
    await expect(card).toBeVisible({ timeout: 20_000 })
    await expect(card.getByText("7 km · 150 vagas")).toBeVisible()
    await expect(card.getByText("Nenhum lote cadastrado")).toBeVisible()

    await card.getByRole("button", { name: `Novo lote para ${nome}` }).click()
    const tierDialog = page.getByRole("dialog", { name: `Novo lote — ${nome}` })
    await tierDialog.getByLabel("Nome do lote").fill("Lote promocional")
    await tierDialog.getByLabel("Preço (R$)").fill("79,90")
    await tierDialog.getByLabel("Início das vendas").fill("2026-11-01T00:00")
    await tierDialog.getByLabel("Fim das vendas").fill("2026-10-01T00:00")
    await tierDialog.getByRole("button", { name: "Salvar lote" }).click()
    await expect(tierDialog.getByText("O fim deve ser depois do início")).toBeVisible()

    await tierDialog.getByLabel("Fim das vendas").fill("2026-12-15T23:59")
    await tierDialog.getByRole("button", { name: "Salvar lote" }).click()

    await expect(card.getByText("Lote promocional")).toBeVisible({ timeout: 20_000 })
    await expect(card.getByText("R$ 79,90")).toBeVisible()
    await expect(card.getByText("01/11/2026 às 00:00 até 15/12/2026 às 23:59 · sem limite próprio")).toBeVisible()
  })

  test("operador vê as distâncias sem botões de cadastro", async ({ page }) => {
    await loginAsAdmin(page, OPERATOR_EMAIL)
    await page.goto("/admin/eventos/1/distancias")

    await expect(page.getByRole("article", { name: "5 km" })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText("Seu perfil tem acesso somente leitura às corridas.")).toBeVisible()
    await expect(page.getByRole("button", { name: "Nova distância" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: /Novo lote/ })).toHaveCount(0)
  })

  test("corrida inexistente responde 404", async ({ page }) => {
    await loginAsAdmin(page)
    expect((await page.goto("/admin/eventos/999999/distancias"))?.status()).toBe(404)
  })
})
