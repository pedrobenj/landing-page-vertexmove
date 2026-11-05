import { expect, test } from "@playwright/test"

test.describe("Navegação pública", () => {
  test("header leva para a consulta de inscrição", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("banner").getByRole("link", { name: "Minha inscrição" }).click()
    await expect(page).toHaveURL("/consulta")
    await expect(page.getByRole("heading", { level: 1, name: "Consultar inscrição" })).toBeVisible()
  })

  test("rodapé leva para medalhas", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("contentinfo").getByRole("link", { name: "Medalhas" }).click()
    await expect(page).toHaveURL("/medalhas")
    await expect(page).toHaveTitle(/Medalhas \| Vertex Grupo de Corrida/)
  })

  const publicRoutes = [
    { path: "/consulta", title: "Consultar inscrição" },
    { path: "/medalhas", title: "Complete sua coleção" },
    { path: "/privacidade", title: "Política de privacidade" },
    { path: "/corridas/corrida-vertex-beira-mar-2026", title: "Página da corrida" },
    { path: "/regulamento/corrida-vertex-beira-mar-2026", title: "Regulamento" },
  ]

  for (const route of publicRoutes) {
    test(`${route.path} responde e usa o layout público`, async ({ page }) => {
      const response = await page.goto(route.path)
      expect(response?.status()).toBe(200)
      await expect(page.getByRole("heading", { level: 1, name: route.title })).toBeVisible()
      await expect(page.getByRole("contentinfo")).toContainText("Desenvolvido por Pedro Benjamin")
    })
  }
})
