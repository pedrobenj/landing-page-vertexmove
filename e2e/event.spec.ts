import { expect, test } from "@playwright/test"

const SLUG = "corrida-vertex-beira-mar-2026"
const EVENT_URL = `/corridas/${SLUG}`

test.describe("Página da corrida", () => {
  test("mostra o evento do mock com distâncias e preços", async ({ page }) => {
    await page.goto(EVENT_URL)

    await expect(page.getByRole("heading", { level: 1, name: "Corrida Vertex Beira-Mar 2026" })).toBeVisible()
    await expect(page).toHaveTitle(/Corrida Vertex Beira-Mar 2026/)
    await expect(page.getByText("Domingo, 6 de dezembro de 2026")).toBeVisible()

    const distances = page.getByRole("region", { name: "Escolha sua distância" })
    await expect(distances.getByRole("article")).toHaveCount(3)
    const fiveKm = distances.getByRole("article", { name: "5 km", exact: true })
    await expect(fiveKm.getByText("R$ 89,90")).toBeVisible()
    await expect(fiveKm.getByText("1º lote")).toBeVisible()

    await expect(page.getByRole("region", { name: "Escolha seu kit" }).getByRole("article")).toHaveCount(2)
    await expect(page.getByRole("link", { name: /Regulamento — Corrida Vertex Beira-Mar 2026/ })).toBeVisible()
    await expect(page.getByRole("link", { name: "Ver regulamento completo" })).toHaveAttribute(
      "href",
      `/regulamento/${SLUG}`,
    )
  })

  test("FAQ abre a resposta ao clicar na pergunta", async ({ page }) => {
    await page.goto(EVENT_URL)
    const question = page.getByRole("button", { name: "Quais são as formas de pagamento?" })
    await question.click()
    await expect(page.getByText(/Pix e cartão de crédito/)).toBeVisible()
    await expect(question).toHaveAttribute("aria-expanded", "true")
  })

  test("distância lotada aparece como esgotada", async ({ page }) => {
    await page.goto("/corridas/night-run-vertex-aterro")
    const tenKm = page.getByRole("article", { name: "10 km", exact: true })
    await expect(tenKm.getByText("Esgotado", { exact: true })).toBeVisible()
    await expect(tenKm.getByText("R$")).toHaveCount(0)
  })

  test("slug inexistente e rascunho respondem 404", async ({ page }) => {
    for (const slug of ["nao-existe", "corrida-de-natal-vertex-2026"]) {
      const response = await page.goto(`/corridas/${slug}`)
      expect(response?.status()).toBe(404)
    }
  })

  test("tem JSON-LD SportsEvent", async ({ page }) => {
    await page.goto(EVENT_URL)
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent()
    const data = JSON.parse(raw ?? "{}")
    expect(data["@type"]).toBe("SportsEvent")
    expect(data.name).toBe("Corrida Vertex Beira-Mar 2026")
    expect(data.startDate).toBe("2026-12-06T05:30:00-03:00")
    expect(data.location["@type"]).toBe("Place")
    expect(data.location.geo["@type"]).toBe("GeoCoordinates")
    expect(data.organizer.name).toBe("Vertex Grupo de Corrida")
  })

  test("barra de inscrição fixa só no mobile; no desktop o botão fica no hero", async ({ page, isMobile }) => {
    await page.goto(EVENT_URL)
    const bar = page.getByTestId("mobile-registration-bar")
    const hero = page.getByRole("region", { name: "Corrida Vertex Beira-Mar 2026" })

    if (isMobile) {
      await expect(bar).toBeVisible()
      await expect(bar.getByText("R$ 69,90")).toBeVisible()
      await expect(bar.getByRole("link", { name: "Inscrever-se" })).toHaveAttribute("href", `${EVENT_URL}/inscricao`)
      await expect(hero.getByRole("link", { name: "Inscrever-se" })).toBeHidden()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
    } else {
      await expect(bar).toBeHidden()
      await expect(hero.getByRole("link", { name: "Inscrever-se" })).toHaveAttribute("href", `${EVENT_URL}/inscricao`)
    }
  })
})
