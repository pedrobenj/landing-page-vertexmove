import { expect, test } from "@playwright/test"

test.describe("Home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("exibe o hero com os dois CTAs", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Sua próxima corrida começa aqui" })).toBeVisible()

    const hero = page.locator("section").first()
    await expect(hero.getByRole("link", { name: "Quero me inscrever" })).toBeVisible()
    await expect(hero.getByRole("link", { name: "Consultar minha inscrição" })).toHaveAttribute("href", "/consulta")
  })

  test("lista as corridas abertas (mock)", async ({ page }) => {
    const section = page.locator("#corridas")
    await expect(section.getByRole("heading", { name: "Próximas corridas" })).toBeVisible()

    const events = section.getByRole("listitem")
    await expect(events).toHaveCount(3)
    await expect(section.getByText("Corrida Vertex Beira-Mar 2026")).toBeVisible()
    await expect(section.getByText("Night Run Vertex")).toBeVisible()
    await expect(section.getByText("Desafio Vertex Parque do Cocó")).toBeVisible()
    await expect(section.getByText(/6 de dezembro de 2026 · largada 05:30/)).toBeVisible()
  })

  test("o CTA do hero leva até a lista de corridas", async ({ page }) => {
    await page.locator("section").first().getByRole("link", { name: "Quero me inscrever" }).click()
    await expect(page).toHaveURL(/#corridas$/)
    await expect(page.locator("#corridas")).toBeInViewport()
  })

  test("o card da corrida leva para a página do evento", async ({ page }) => {
    await page.locator("#corridas").getByRole("link", { name: "Ver corrida" }).first().click()
    await expect(page).toHaveURL("/corridas/corrida-vertex-beira-mar-2026")
  })

  test("mostra os 6 passos de \"Como funciona\" em ordem", async ({ page }) => {
    const steps = page.getByRole("region", { name: "Como funciona" }).getByRole("listitem")
    await expect(steps).toHaveCount(6)
    await expect(steps.first()).toContainText("Escolha a prova")
    await expect(steps.last()).toContainText("Receba sua medalha")
  })

  test("o rodapé tem o crédito do desenvolvedor", async ({ page }) => {
    await expect(page.getByRole("contentinfo")).toContainText("Desenvolvido por Pedro Benjamin")
  })

  test("não tem rolagem horizontal", async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
