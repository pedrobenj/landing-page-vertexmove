import { expect, test } from "@playwright/test"

// Corridas abertas do seed do mock. Specs do admin publicam corridas temporárias em paralelo (outro
// worker), então a home confere as do seed e nunca uma contagem exata.
const SEED_OPEN_EVENTS = ["Corrida Vertex Beira-Mar 2026", "Night Run Vertex", "Desafio Vertex Parque do Cocó"]

const SECTION_HEADINGS = [
  "Próximos topos",
  "Do primeiro passo ao pódio",
  "Quem sobe junto",
  "Topos conquistados",
  "Vista a subida",
  "Outras trilhas, com desconto",
  "Marcas na nossa subida",
]

test.describe("Home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("o hero destaca a próxima corrida aberta com o CTA de inscrição", async ({ page }) => {
    // Specs do admin publicam corridas temporárias em paralelo: confere o formato, não o nome.
    const hero = page.getByRole("region").filter({ has: page.getByRole("heading", { level: 1 }) }).first()
    await expect(hero.getByText("Próximo topo")).toBeVisible()
    await expect(hero.getByRole("link", { name: /^Começar a subida/ })).toHaveAttribute("href", /^\/corridas\/[a-z0-9-]+$/)
    await expect(hero.getByRole("link", { name: "Ver todas as provas" })).toHaveAttribute("href", "#corridas")
  })

  test("as seções aparecem na ordem nova", async ({ page }) => {
    const main = page.getByRole("main")
    // Espera as seções com dados (Suspense) terminarem de carregar.
    await expect(main.getByRole("heading", { level: 2, name: "Outras trilhas, com desconto" })).toBeVisible()
    await expect(main.getByRole("status")).toHaveCount(0)

    const headings = await main.getByRole("heading", { level: 2 }).allTextContents()
    expect(headings).toEqual(SECTION_HEADINGS)
  })

  test("não tem mais os traços da referência (cards de destaque e frase de três batidas)", async ({ page }) => {
    await expect(page.getByRole("region", { name: "Destaques" })).toHaveCount(0)
    await expect(page.getByText("Corra. Conecte-se. Evolua.")).toHaveCount(0)
  })

  test("lista as corridas passadas (mock)", async ({ page }) => {
    const section = page.getByRole("region", { name: "Topos conquistados" })
    await expect(section.getByRole("article")).toHaveCount(4)
    await expect(section.getByText("Night Run Vertex 2025")).toBeAttached()
    await expect(section.getByText("10 DE MAI. DE 2026")).toBeVisible()
    await expect(section.getByRole("link", { name: "Ver todos os topos" })).toHaveAttribute(
      "href",
      "/corridas/encerradas",
    )
  })

  test("lista as corridas abertas (mock)", async ({ page }) => {
    const section = page.locator("#corridas")
    await expect(section.getByRole("heading", { name: "Próximos topos" })).toBeVisible()
    // Selo com a contagem real (≥ as do seed), não um número fixo: ver SEED_OPEN_EVENTS.
    const badge = section.getByText(/^\d+ corridas? abertas?$/)
    await expect(badge).toBeVisible()
    expect(Number.parseInt((await badge.textContent()) ?? "", 10)).toBeGreaterThanOrEqual(SEED_OPEN_EVENTS.length)

    for (const name of SEED_OPEN_EVENTS) {
      await expect(section.getByRole("heading", { level: 3, name, exact: true })).toBeVisible()
    }
    await expect(section.getByText("06/12/2026 · Largada 05:30")).toBeVisible()
    await expect(section.getByRole("link", { name: "Ver os topos conquistados" })).toHaveAttribute(
      "href",
      "/corridas/encerradas",
    )
  })

  test("o CTA secundário do hero leva até a lista de corridas", async ({ page }) => {
    await page.getByRole("link", { name: "Ver todas as provas" }).click()
    await expect(page).toHaveURL(/#corridas$/)
    await expect(page.locator("#corridas")).toBeInViewport()
  })

  test("o card da corrida leva para a página do evento", async ({ page }) => {
    await page.locator("#corridas").getByRole("link", { name: /^Inscrever-se em Corrida Vertex Beira-Mar 2026/ }).click()
    await expect(page).toHaveURL("/corridas/corrida-vertex-beira-mar-2026")
  })

  test("mostra os 6 degraus de \"Como funciona\" em ordem e o atalho da consulta", async ({ page }) => {
    const section = page.getByRole("region", { name: "Do primeiro passo ao pódio" })
    const steps = section.getByRole("list").getByRole("listitem")
    await expect(steps).toHaveCount(6)
    await expect(steps.first()).toContainText("Escolha seu topo")
    await expect(steps.last()).toContainText("Chegue ao topo")
    await expect(section.getByRole("link", { name: "Onde está minha inscrição?" })).toHaveAttribute("href", "/consulta")
  })

  test("parceiros, loja e comunidade", async ({ page }) => {
    await expect(page.getByRole("region", { name: "Marcas na nossa subida" }).getByRole("listitem")).toHaveCount(6)
    await expect(page.getByRole("region", { name: "Vista a subida" }).getByRole("link", { name: "Conhecer a loja" })).toHaveAttribute(
      "href",
      "/loja",
    )
    const community = page.getByRole("region", { name: "Quem sobe junto" })
    await expect(community.getByRole("list", { name: "O que você encontra no Vertex" }).getByRole("listitem")).toHaveCount(4)
    await expect(community.getByRole("link", { name: "Conheça o Vertex" })).toHaveAttribute("href", "/sobre")
  })

  test("lista 2 corridas parceiras com cupom e botão de copiar", async ({ page }) => {
    const section = page.getByRole("region", { name: "Outras trilhas, com desconto" })
    const cards = section.getByRole("article")
    await expect(cards).toHaveCount(2)
    await expect(section.getByText("VERTEX10", { exact: true })).toHaveCount(2)
    await expect(section.getByRole("button", { name: "Copiar cupom VERTEX10" })).toHaveCount(2)

    const signUp = cards.first().getByRole("link", { name: /Inscrever-se/ })
    await expect(signUp).toHaveAttribute("href", /^https:\/\//)
    await expect(signUp).toHaveAttribute("target", "_blank")
    await expect(section.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "/corridas-parceiras")
  })

  test("copia o cupom", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "permissões de clipboard só no Chromium")
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    const section = page.getByRole("region", { name: "Outras trilhas, com desconto" })
    await section.getByRole("button", { name: "Copiar cupom VERTEX10" }).first().click()
    await expect(page.getByText("Cupom copiado!")).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("VERTEX10")
  })

  test("mostra os números da comunidade", async ({ page }) => {
    const stats = page.getByRole("list", { name: "Números da comunidade" }).getByRole("listitem")
    await expect(stats).toHaveCount(4)
    await expect(stats.first()).toContainText("12+")
  })

  test("o rodapé tem o crédito do desenvolvedor", async ({ page }) => {
    await expect(page.getByRole("contentinfo")).toContainText("Desenvolvido por Pedro Benjamin")
  })
})

test.describe("Home em 360px", () => {
  test.use({ viewport: { width: 360, height: 780 } })

  test("não tem rolagem horizontal", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("region", { name: "Outras trilhas, com desconto" })).toBeVisible()
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(360)
  })
})
