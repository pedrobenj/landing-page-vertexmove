import { expect, test } from "@playwright/test"

import { loginAsAdmin, OPERATOR_EMAIL } from "./helpers/admin-login"

/** Eventos do seed do mock (src/server/api/mocks/mock-seed.ts): 3 publicados, 1 rascunho, 4 encerrados. */
const SEED_PUBLISHED = "Corrida Vertex Beira-Mar 2026"
const SEED_DRAFT = "Corrida de Natal Vertex 2026"
const SEED_CLOSED = "Night Run Vertex 2025"

test.describe("Admin — lista de corridas", () => {
  test.describe.configure({ timeout: 60_000 })

  test("lista as corridas do mock e filtra por rascunho", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/eventos")

    await expect(page.getByRole("heading", { level: 1, name: "Corridas" })).toBeVisible()
    const rows = page.getByRole("table").getByRole("row")
    await expect(page.getByRole("link", { name: SEED_PUBLISHED, exact: true })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole("link", { name: SEED_DRAFT, exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: SEED_CLOSED, exact: true })).toBeVisible()
    // Cabeçalho + pelo menos os 8 do seed (outros testes podem criar corridas no mock em memória).
    expect(await rows.count()).toBeGreaterThanOrEqual(9)
    await expect(page.getByRole("link", { name: "Nova corrida" })).toBeVisible()

    await page.getByLabel("Status").click()
    await page.getByRole("option", { name: "Rascunho" }).click()

    await expect(page.getByRole("link", { name: SEED_PUBLISHED, exact: true })).toBeHidden()
    await expect(page.getByRole("link", { name: SEED_DRAFT, exact: true })).toBeVisible()
    // Só rascunhos: toda linha do corpo tem o selo "Rascunho".
    const bodyRows = page.getByRole("table").locator("tbody tr")
    const total = await bodyRows.count()
    expect(total).toBeGreaterThanOrEqual(1)
    await expect(bodyRows.filter({ hasText: "Rascunho" })).toHaveCount(total)
  })

  test("operador vê a lista sem o botão Nova corrida", async ({ page }) => {
    await loginAsAdmin(page, OPERATOR_EMAIL)
    await page.goto("/admin/eventos")

    await expect(page.getByRole("link", { name: SEED_PUBLISHED, exact: true })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole("link", { name: "Nova corrida" })).toHaveCount(0)
  })
})
