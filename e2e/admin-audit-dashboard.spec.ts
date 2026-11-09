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

  test("saúda o admin, mostra atalhos e métricas em breve", async ({ page }) => {
    await loginAsAdmin(page)

    await expect(page.getByText("Olá, Organização Vertex!")).toBeVisible()
    await expect(page.getByText("Perfil: Organização")).toBeVisible()
    const shortcuts = page.getByRole("navigation", { name: "Atalhos" })
    for (const label of ["Nova corrida", "Corridas", "Tamanhos de camisa", "Auditoria"]) {
      await expect(shortcuts.getByRole("link", { name: new RegExp(label) })).toBeVisible()
    }
    await expect(page.getByRole("region", { name: "Números" }).getByText("Em breve")).toHaveCount(4)
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
