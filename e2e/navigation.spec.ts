import { expect, test } from "@playwright/test"

test.describe("Navegação pública", () => {
  test("menu lateral abre, navega e fecha", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("banner").getByRole("button", { name: "Abrir menu" }).click()

    const menu = page.getByRole("dialog", { name: "Menu" })
    await expect(menu).toBeVisible()
    for (const label of ["Início", "Corridas", "Loja", "Corridas Parceiras", "Conheça o Vertex", "Parceiros", "Contato"]) {
      await expect(menu.getByRole("link", { name: label, exact: true })).toBeVisible()
    }
    await expect(menu.getByRole("link", { name: "Área administrativa" })).toHaveAttribute("href", "/admin/login")

    await menu.getByRole("link", { name: "Consultar inscrição" }).click()
    await expect(page).toHaveURL("/consulta")
    await expect(page.getByRole("heading", { level: 1, name: "Consultar inscrição" })).toBeVisible()
    await expect(menu).toBeHidden()
  })

  test("menu lateral fecha pelo botão Fechar", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: "Abrir menu" }).click()
    const menu = page.getByRole("dialog", { name: "Menu" })
    await expect(menu).toBeVisible()
    await menu.getByRole("button", { name: "Fechar menu" }).click()
    await expect(menu).toBeHidden()
  })

  test("rodapé tem contato, navegação e crédito, e leva para a loja", async ({ page }) => {
    await page.goto("/")
    const footer = page.getByRole("contentinfo")
    await expect(footer.getByRole("heading", { name: "Contato" })).toBeVisible()
    await expect(footer.getByRole("link", { name: /contato@vertexcorrida\.com\.br/ })).toHaveAttribute(
      "href",
      "mailto:contato@vertexcorrida.com.br",
    )
    await expect(footer.getByRole("link", { name: "Área administrativa" })).toBeVisible()
    await expect(footer).toContainText("Desenvolvido por Pedro Benjamin")

    await footer.getByRole("link", { name: "Loja", exact: true }).click()
    await expect(page).toHaveURL("/loja")
    await expect(page).toHaveTitle(/Loja \| Vertex Grupo de Corrida/)
  })

  const publicRoutes = [
    { path: "/consulta", title: "Consultar inscrição" },
    { path: "/loja", title: "Camisas e medalhas" },
    { path: "/privacidade", title: "Política de privacidade" },
    { path: "/corridas/corrida-vertex-beira-mar-2026", title: "Corrida Vertex Beira-Mar 2026" },
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
