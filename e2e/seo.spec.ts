import { expect, test } from "@playwright/test"

test.describe("SEO", () => {
  test("robots.txt bloqueia admin, API e páginas de inscrição", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text()
    expect(body).toContain("Disallow: /admin")
    expect(body).toContain("Disallow: /api")
    expect(body).toContain("Disallow: /inscricao")
    expect(body).toContain("Sitemap:")
  })

  test("sitemap.xml lista as páginas públicas", async ({ request }) => {
    const response = await request.get("/sitemap.xml")
    expect(response.ok()).toBe(true)
    const body = await response.text()
    expect(body).toContain("/consulta")
    expect(body).toContain("/sobre")
    // Com o mock (USE_MOCK_API=true) a loja está disponível e entra no sitemap.
    expect(body).toContain("/loja")
    expect(body).toContain("/corridas/corrida-vertex-beira-mar-2026")
    expect(body).not.toContain("/corridas/corrida-de-natal-vertex-2026")
    expect(body).not.toContain("/admin")
  })

  test("home tem título e idioma pt-BR", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle("Vertex Grupo de Corrida — Inscrições")
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR")
  })
})
