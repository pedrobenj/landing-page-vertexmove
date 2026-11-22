import { expect, type Page, test } from "@playwright/test"

import { cancelRegistration, createPaidRegistration, openRegistration } from "./helpers/admin-registrations"
import { loginAsAdmin } from "./helpers/admin-login"
import { NAVIGATION_TIMEOUT } from "./helpers/registration-flow"

/** Inscrição paga e cancelada pelo admin: o estorno fica pendente na fila de pagamentos. */
async function createRefundPending(page: Page): Promise<string> {
  const code = await createPaidRegistration(page)
  await loginAsAdmin(page)
  await openRegistration(page, code)
  await cancelRegistration(page)
  return code
}

async function openQueue(page: Page, situacao: string) {
  await page.getByRole("navigation", { name: "Menu do admin" }).getByRole("link", { name: "Pagamentos" }).click()
  await expect(page).toHaveURL("/admin/pagamentos", { timeout: NAVIGATION_TIMEOUT })
  await page.getByLabel("Situação").click()
  await page.getByRole("option", { name: situacao }).click()
}

function rowOf(page: Page, code: string) {
  const origin = page.getByRole("link", { name: `Inscrição ${code}` })
  return { origin, row: page.getByRole("row").filter({ has: origin }) }
}

test.describe("Admin: pagamentos com pendência", () => {
  test.describe.configure({ timeout: 120_000 })

  test("abre em estorno pendente com o motivo e a origem (seed)", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/pagamentos")
    await expect(page.getByRole("heading", { level: 1, name: "Pagamentos" })).toBeVisible()
    // Inscrição 21 do seed: cancelada pelo admin depois de paga (nenhum teste mexe nela).
    const { row } = rowOf(page, "VX-2026-00000021")
    await expect(row).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(row.getByText("Motivo: Cancelada pelo admin")).toBeVisible()
    await expect(row.getByRole("button", { name: /^Estornar pagamento/ })).toBeVisible()
    await expect(row.getByRole("button", { name: /^Conciliar pagamento/ })).toHaveCount(0)
  })

  test("estorna com motivo e confirmação dupla; o pagamento sai da fila", async ({ page }) => {
    const code = await createRefundPending(page)
    await openQueue(page, "Estorno pendente")
    const { origin, row } = rowOf(page, code)
    await expect(row).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await row.getByRole("button", { name: /^Estornar pagamento/ }).click()
    const first = page.getByRole("dialog", { name: "Estornar este pagamento?" })
    await expect(first.getByRole("button", { name: "Continuar" })).toBeDisabled()
    await first.getByLabel("Motivo do estorno").fill("Inscrição cancelada a pedido do atleta")
    await first.getByRole("button", { name: "Continuar" }).click()
    await page.getByRole("dialog", { name: "Confirmar o estorno?" }).getByRole("button", { name: /^Estornar R\$/ }).click()

    await expect(page.getByText("Estorno realizado")).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(origin).toHaveCount(0, { timeout: NAVIGATION_TIMEOUT })
  })

  test("leva à inscrição pela origem e concilia com o Mercado Pago", async ({ page }, testInfo) => {
    // Só `criado | pendente | em_analise` concilia: usa pendências do seed, uma por projeto (rodam em paralelo).
    const target =
      testInfo.project.name === "mobile"
        ? { situacao: "Valor divergente", code: "VX-2026-00000018" }
        : { situacao: "Em análise", code: "VX-2026-00000020" }
    await loginAsAdmin(page)
    await openQueue(page, target.situacao)
    const { origin, row } = rowOf(page, target.code)
    await expect(row).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    // A origem traz a corrida: o link vai direto ao detalhe da inscrição dentro dela.
    await origin.click()
    await expect(page).toHaveURL(/\/admin\/eventos\/1\/inscricoes\/\d+$/, { timeout: NAVIGATION_TIMEOUT })
    await expect(page.getByRole("heading", { level: 1, name: target.code })).toBeVisible()

    await openQueue(page, target.situacao)
    await expect(row).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await row.getByRole("button", { name: /^Conciliar pagamento/ }).click()
    await page.getByRole("dialog", { name: "Conciliar com o Mercado Pago?" }).getByRole("button", { name: "Conciliar" }).click()
    await expect(page.getByText("Pagamento conciliado com o Mercado Pago")).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(origin).toHaveCount(0, { timeout: NAVIGATION_TIMEOUT })
  })
})
