import { expect, test } from "@playwright/test"

import { loginAsAdmin, OPERATOR_EMAIL } from "./helpers/admin-login"
import { createDraftEvent, deleteEvent } from "./helpers/admin-events"

test.describe("Admin — auditoria", () => {
  test.describe.configure({ timeout: 90_000 })

  test("mostra uma entrada depois de publicar uma corrida", async ({ page }) => {
    test.slow()
    await loginAsAdmin(page)
    const event = await createDraftEvent(page, "Corrida Auditoria")

    const main = page.getByRole("main")
    await page.getByRole("button", { name: "Publicar" }).click()
    await expect(main.getByText("Publicado", { exact: true })).toBeVisible({ timeout: 30_000 })

    await page.getByRole("navigation", { name: "Menu do admin" }).getByRole("link", { name: "Auditoria" }).click()
    await expect(page.getByRole("heading", { level: 1, name: "Auditoria" })).toBeVisible()
    const entry = page.getByRole("row").filter({ hasText: "Corrida publicada" }).filter({ hasText: `Corrida #${event.id}` })
    await expect(entry.first()).toBeVisible({ timeout: 20_000 })
    await expect(entry.first()).toContainText("Organização Vertex")

    // Limpeza: volta a rascunho e exclui.
    await page.goto(event.url)
    await page.getByRole("button", { name: "Despublicar" }).click()
    await expect(main.getByText("Rascunho", { exact: true })).toBeVisible({ timeout: 30_000 })
    await deleteEvent(page, event.url)
  })
})

test.describe("Admin — dashboard", () => {
  test.describe.configure({ timeout: 60_000 })

  test("faixa navy com saudação, atalhos e números em breve", async ({ page }) => {
    await loginAsAdmin(page)

    const hero = page.getByRole("region", { name: "Bom te ver, Organização Vertex" })
    await expect(hero.getByText("Painel do organizador")).toBeVisible()
    await expect(hero.getByRole("link", { name: "Nova corrida" })).toHaveAttribute("href", "/admin/eventos/novo")
    const shortcuts = page.getByRole("navigation", { name: "Atalhos" })
    for (const label of ["Nova corrida", "Corridas", "Tamanhos de camisa", "Auditoria"]) {
      await expect(shortcuts.getByRole("link", { name: new RegExp(label) })).toBeVisible()
    }
    await expect(page.getByRole("region", { name: "Números" })).toContainText("relatórios do backend")
  })

  test("próximos topos: até 3 corridas futuras com o checklist de inscrições", async ({ page }) => {
    await loginAsAdmin(page)

    const upcoming = page.getByRole("region", { name: "Próximos topos" })
    const cards = upcoming.getByRole("article")
    await expect(cards).toHaveCount(3, { timeout: 20_000 })
    // Ordem por data; publicada completa abre inscrições, rascunho completo só falta publicar.
    await expect(cards.nth(0)).toContainText("Corrida Vertex Beira-Mar 2026")
    await expect(cards.nth(0)).toContainText("Pronta para inscrições")
    const draft = upcoming.getByRole("article", { name: "Corrida de Natal Vertex 2026" })
    await expect(draft).toContainText("Tudo pronto: falta só publicar")
    await expect(draft.getByRole("list", { name: /Checklist/ }).getByRole("listitem")).toHaveCount(3)
    await expect(draft.getByRole("link", { name: /Gerenciar/ })).toHaveAttribute("href", /\/admin\/eventos\/\d+$/)
  })

  test("operador não vê o atalho Nova corrida", async ({ page }) => {
    await loginAsAdmin(page, OPERATOR_EMAIL)
    const shortcuts = page.getByRole("navigation", { name: "Atalhos" })
    await expect(shortcuts.getByRole("link", { name: /Corridas/ })).toBeVisible()
    await expect(shortcuts.getByRole("link", { name: /Nova corrida/ })).toHaveCount(0)
  })

  test("inscrições da corrida: em breve", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/eventos/1/inscricoes")
    await expect(page.getByRole("heading", { level: 1, name: "Inscrições" })).toBeVisible()
    await expect(page.getByText("Em breve: aguardando endpoint do backend.")).toBeVisible()
  })
})
