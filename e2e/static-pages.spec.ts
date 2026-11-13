import { expect, test } from "@playwright/test"

// Roda com USE_MOCK_API=true: corridas parceiras, encerradas, parceiros e números vêm do mock/demonstração.

const STATIC_PAGES = [
  { path: "/sobre", title: "O Vertex" },
  { path: "/parceiros", title: "Parceiros" },
  { path: "/contato", title: "Fale com a gente" },
  { path: "/corridas-parceiras", title: "Outras trilhas" },
  { path: "/corridas/encerradas", title: "Topos conquistados" },
  { path: "/privacidade", title: "Política de privacidade" },
  { path: "/regulamento/corrida-vertex-beira-mar-2026", title: "Regulamento" },
  { path: "/inscricao/VX-2026-99999999", title: "Sua inscrição" },
]

test.describe("Páginas institucionais", () => {
  for (const { path, title } of STATIC_PAGES) {
    test(`${path} responde e mostra o título`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible()
      await expect(page.getByRole("contentinfo")).toContainText("Desenvolvido por Pedro Benjamin")
    })
  }

  // Páginas de conteúdo usam o cabeçalho navy (`PageHero`): o h1 nomeia a própria região do topo.
  const CONTENT_PAGES = [
    { path: "/sobre", title: "O Vertex" },
    { path: "/corridas/encerradas", title: "Topos conquistados" },
    { path: "/corridas-parceiras", title: "Outras trilhas" },
    { path: "/loja", title: "Camisas e acessórios" },
    { path: "/consulta", title: "Onde está minha inscrição?" },
    { path: "/parceiros", title: "Parceiros" },
    { path: "/contato", title: "Fale com a gente" },
    { path: "/privacidade", title: "Política de privacidade" },
    { path: "/regulamento/corrida-vertex-beira-mar-2026", title: "Regulamento" },
  ]

  for (const { path, title } of CONTENT_PAGES) {
    test(`${path} abre com o cabeçalho da página`, async ({ page }) => {
      await page.goto(path)
      const hero = page.getByRole("region", { name: title, exact: true })
      await expect(hero.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible()
    })
  }

  test("regulamento volta para a prova", async ({ page }) => {
    await page.goto("/regulamento/corrida-vertex-beira-mar-2026")
    await expect(page.getByRole("link", { name: "Voltar para a prova" })).toHaveAttribute(
      "href",
      "/corridas/corrida-vertex-beira-mar-2026",
    )
  })

  test("O Vertex mostra o nome, a história, a missão, os números e o CTA", async ({ page }) => {
    await page.goto("/sobre")
    await expect(page.getByText("Por que Vertex", { exact: true })).toBeVisible()
    await expect(page.getByText("Nossa subida", { exact: true })).toBeVisible()
    await expect(page.getByText("Onde queremos chegar", { exact: true })).toBeVisible()
    const stats = page.getByRole("region", { name: "Números da comunidade" }).getByRole("listitem")
    await expect(stats).toHaveCount(4)
    await expect(stats.first()).toContainText("12+")
    await expect(page.getByRole("link", { name: "Ver os próximos topos" })).toHaveAttribute("href", "/#corridas")
  })

  test("parceiros mostra os 6 parceiros de demonstração e o CTA", async ({ page }) => {
    await page.goto("/parceiros")
    const partners = page.getByRole("list", { name: "Parceiros do Vertex" }).getByRole("listitem")
    await expect(partners).toHaveCount(6)
    await expect(partners.filter({ hasText: "Academia Movimento" })).toHaveCount(1)
    await expect(page.getByRole("link", { name: /Quero ser parceiro/ })).toBeVisible()
  })

  test("contato mostra os canais e o bloco de treinos", async ({ page }) => {
    await page.goto("/contato")
    const channels = page.getByRole("list", { name: "Canais de contato" }).getByRole("listitem")
    await expect(channels).toHaveCount(3)
    await expect(page.getByRole("link", { name: /contato@vertexcorrida\.com\.br/ }).first()).toHaveAttribute(
      "href",
      "mailto:contato@vertexcorrida.com.br",
    )
    await expect(page.getByRole("heading", { level: 2, name: "Bora treinar junto?" })).toBeVisible()
  })

  test("corridas parceiras lista os 3 cards com cupom e link externo", async ({ page }) => {
    await page.goto("/corridas-parceiras")
    const cards = page.getByRole("main").getByRole("article")
    await expect(cards).toHaveCount(3)
    await expect(cards.first().getByText("VERTEX10")).toBeVisible()
    const signUp = cards.first().getByRole("link", { name: /Inscrever-se/ })
    await expect(signUp).toHaveAttribute("target", "_blank")
    await expect(signUp).toHaveAttribute("rel", "noopener noreferrer")
  })

  test("copiar cupom mostra o toast", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "permissão de clipboard só no Chromium")
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.goto("/corridas-parceiras")
    await page.getByRole("button", { name: "Copiar cupom VERTEX10" }).first().click()
    await expect(page.getByText("Cupom copiado!")).toBeVisible()
  })

  test("corridas encerradas lista as 4 edições do mock", async ({ page }) => {
    await page.goto("/corridas/encerradas")
    const editions = page.getByRole("list", { name: "Edições passadas" }).getByRole("article")
    await expect(editions).toHaveCount(4)
    await expect(editions.filter({ hasText: "Night Run Vertex 2025" })).toHaveCount(1)
  })

  test("regulamento mostra os documentos vigentes com o botão Abrir PDF", async ({ page }) => {
    await page.goto("/regulamento/corrida-vertex-beira-mar-2026")
    const documents = page.getByRole("list", { name: "Documentos vigentes" }).getByRole("listitem")
    await expect(documents).toHaveCount(2)
    await expect(documents.first().getByText("Versão 1.0")).toBeVisible()
    await expect(documents.first().getByRole("link", { name: /Abrir PDF/ })).toHaveAttribute("target", "_blank")
  })

  test("regulamento de corrida inexistente responde 404", async ({ page }) => {
    const response = await page.goto("/regulamento/corrida-que-nao-existe")
    expect(response?.status()).toBe(404)
  })

  test("código válido sem a inscrição feita neste navegador leva para a consulta", async ({ page }) => {
    // Sem o cookie da inscrição o backend responde 401 (nem revela se o código existe).
    // Código fora do alcance do mock (que guarda em memória as inscrições de outros testes).
    await page.goto("/inscricao/VX-2026-99999999")
    await expect(page.getByText("VX-2026-99999999").first()).toBeVisible()
    await expect(page.getByText("Abra no aparelho da inscrição")).toBeVisible()
    await expect(page.getByText(/mesmo aparelho/)).toBeVisible()
    await expect(page.getByRole("link", { name: "Consultar inscrição" })).toHaveAttribute("href", "/consulta")
  })

  test("inscrição com código em formato inválido responde 404", async ({ page }) => {
    const response = await page.goto("/inscricao/codigo-invalido")
    expect(response?.status()).toBe(404)
  })

  test("privacidade não menciona dados que o site não coleta", async ({ page }) => {
    await page.goto("/privacidade")
    const main = page.getByRole("main")
    await expect(main.getByRole("heading", { level: 2, name: "Quais dados coletamos" })).toBeVisible()
    await expect(main).not.toContainText(/sexo|g[êe]nero|contato de emerg[êe]ncia|equipe|assessoria/i)
  })
})
