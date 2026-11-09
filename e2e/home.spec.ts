import { expect, test } from "@playwright/test"

// Corridas abertas do seed do mock. Specs do admin publicam corridas temporárias em paralelo (outro
// worker), então a home confere as do seed e nunca uma contagem exata.
const SEED_OPEN_EVENTS = ["Corrida Vertex Beira-Mar 2026", "Night Run Vertex", "Desafio Vertex Parque do Cocó"]

const SECTION_HEADINGS = [
  "Destaques",
  "Corridas que já vivemos",
  "Escolha seu próximo desafio",
  "Como funciona",
  "Acompanhe sua inscrição!",
  "Marcas que correm com a gente",
  "Loja Vertex",
  "Quem corre junto vai mais longe",
  "Próximas corridas parceiras",
  "Números da comunidade",
]

test.describe("Home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("exibe o hero com os dois CTAs", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Corra. Conecte-se. Evolua." })).toBeVisible()

    const hero = page.getByRole("region", { name: "Corra. Conecte-se. Evolua." })
    await expect(hero.getByRole("link", { name: "Quero me inscrever" })).toHaveAttribute("href", "#corridas")
    await expect(hero.getByRole("link", { name: "Conheça nossa história" })).toHaveAttribute("href", "/sobre")
  })

  test("as seções aparecem na ordem da referência", async ({ page }) => {
    const main = page.getByRole("main")
    // Espera as seções com dados (Suspense) terminarem de carregar.
    await expect(main.getByRole("heading", { level: 2, name: "Próximas corridas parceiras" })).toBeVisible()
    await expect(main.getByRole("status")).toHaveCount(0)

    const headings = await main.getByRole("heading", { level: 2 }).allTextContents()
    expect(headings).toEqual(SECTION_HEADINGS)
  })

  test("os 3 cards de destaque têm os links certos", async ({ page }) => {
    const highlights = page.getByRole("region", { name: "Destaques" })
    await expect(highlights.getByRole("article")).toHaveCount(3)
    // Selo com a contagem real (≥ as do seed), não um número fixo: ver SEED_OPEN_EVENTS.
    const badge = highlights.getByText(/^\d+ corridas? abertas?$/)
    await expect(badge).toBeVisible()
    expect(Number.parseInt((await badge.textContent()) ?? "", 10)).toBeGreaterThanOrEqual(SEED_OPEN_EVENTS.length)
    await expect(highlights.getByRole("link", { name: "Garantir minha vaga" })).toHaveAttribute("href", "#corridas")
    await expect(highlights.getByRole("link", { name: "Consultar", exact: true })).toHaveAttribute("href", "/consulta")
    await expect(highlights.getByRole("link", { name: "Acessar a loja" })).toHaveAttribute("href", "/loja")
    await expect(highlights.getByRole("link", { name: "Acompanhe sua inscrição" })).toHaveAttribute("href", "/consulta")
  })

  test("lista as corridas passadas (mock)", async ({ page }) => {
    const section = page.getByRole("region", { name: "Corridas que já vivemos" })
    await expect(section.getByRole("article")).toHaveCount(4)
    await expect(section.getByText("Night Run Vertex 2025")).toBeAttached()
    await expect(section.getByText("10 DE MAI. DE 2026")).toBeVisible()
    await expect(section.getByRole("link", { name: "Ver todas as corridas" })).toHaveAttribute(
      "href",
      "/corridas/encerradas",
    )
  })

  test("lista as corridas abertas (mock)", async ({ page }) => {
    const section = page.locator("#corridas")
    await expect(section.getByRole("heading", { name: "Escolha seu próximo desafio" })).toBeVisible()

    for (const name of SEED_OPEN_EVENTS) {
      await expect(section.getByRole("heading", { level: 3, name, exact: true })).toBeVisible()
    }
    await expect(section.getByText("06/12/2026 · Largada 05:30")).toBeVisible()
    await expect(section.getByRole("link", { name: "Ver corridas encerradas" })).toHaveAttribute(
      "href",
      "/corridas/encerradas",
    )
  })

  test("o CTA do hero leva até a lista de corridas", async ({ page }) => {
    await page.getByRole("link", { name: "Quero me inscrever" }).click()
    await expect(page).toHaveURL(/#corridas$/)
    await expect(page.locator("#corridas")).toBeInViewport()
  })

  test("o card da corrida leva para a página do evento", async ({ page }) => {
    await page.locator("#corridas").getByRole("link", { name: /^Inscrever-se em Corrida Vertex Beira-Mar 2026/ }).click()
    await expect(page).toHaveURL("/corridas/corrida-vertex-beira-mar-2026")
  })

  test("mostra os 6 passos de \"Como funciona\" em ordem", async ({ page }) => {
    const steps = page.getByRole("region", { name: "Como funciona" }).getByRole("listitem")
    await expect(steps).toHaveCount(6)
    await expect(steps.first()).toContainText("Escolha a prova")
    await expect(steps.last()).toContainText("Receba a medalha")
  })

  test("faixa de consulta, parceiros, loja e \"Mais que corrida\"", async ({ page }) => {
    await expect(
      page.getByRole("region", { name: "Acompanhe sua inscrição!" }).getByRole("link", { name: "Consultar minha inscrição" }),
    ).toHaveAttribute("href", "/consulta")
    await expect(page.getByRole("region", { name: "Marcas que correm com a gente" }).getByRole("listitem")).toHaveCount(6)
    await expect(page.getByRole("region", { name: "Loja Vertex" }).getByRole("link", { name: "Conhecer a loja" })).toHaveAttribute(
      "href",
      "/loja",
    )
    const moreThanRunning = page.getByRole("region", { name: "Quem corre junto vai mais longe" })
    await expect(moreThanRunning.getByRole("listitem")).toHaveCount(4)
    await expect(moreThanRunning.getByRole("link", { name: "Conheça o Vertex" })).toHaveAttribute("href", "/sobre")
  })

  test("lista 3 corridas parceiras com cupom e botão de copiar", async ({ page }) => {
    const section = page.getByRole("region", { name: "Próximas corridas parceiras" })
    const cards = section.getByRole("article")
    await expect(cards).toHaveCount(3)
    await expect(section.getByText("VERTEX10", { exact: true })).toHaveCount(3)
    await expect(section.getByRole("button", { name: "Copiar cupom VERTEX10" })).toHaveCount(3)

    const signUp = cards.first().getByRole("link", { name: /Inscrever-se/ })
    await expect(signUp).toHaveAttribute("href", /^https:\/\//)
    await expect(signUp).toHaveAttribute("target", "_blank")
    await expect(section.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "/corridas-parceiras")
  })

  test("copia o cupom", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "permissões de clipboard só no Chromium")
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    const section = page.getByRole("region", { name: "Próximas corridas parceiras" })
    await section.getByRole("button", { name: "Copiar cupom VERTEX10" }).first().click()
    await expect(page.getByText("Cupom copiado!")).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("VERTEX10")
  })

  test("mostra os números da comunidade", async ({ page }) => {
    const stats = page.getByRole("region", { name: "Números da comunidade" }).getByRole("listitem")
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
    await expect(page.getByRole("region", { name: "Próximas corridas parceiras" })).toBeVisible()
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(360)
  })
})
