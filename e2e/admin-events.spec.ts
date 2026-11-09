import { expect, test } from "@playwright/test"

import { loginAsAdmin, OPERATOR_EMAIL } from "./helpers/admin-login"

/** Eventos do seed do mock (src/server/api/mocks/mock-seed.ts): 3 publicados, 1 rascunho, 4 encerrados. */
const SEED_PUBLISHED = "Corrida Vertex Beira-Mar 2026"
const SEED_DRAFT = "Corrida de Natal Vertex 2026"
const SEED_CLOSED = "Night Run Vertex 2025"

test.describe("Admin — lista de corridas", () => {
  test.describe.configure({ timeout: 60_000 })

  test("lista as corridas do mock e filtra por rascunho", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/eventos")

    await expect(page.getByRole("heading", { level: 1, name: "Corridas" })).toBeVisible()
    const rows = page.getByRole("table").getByRole("row")
    await expect(page.getByRole("link", { name: SEED_PUBLISHED, exact: true })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole("link", { name: SEED_DRAFT, exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: SEED_CLOSED, exact: true })).toBeVisible()
    // Cabeçalho + pelo menos os 8 do seed (outros testes podem criar corridas no mock em memória).
    expect(await rows.count()).toBeGreaterThanOrEqual(9)
    await expect(page.getByRole("link", { name: "Nova corrida" })).toBeVisible()

    await page.getByLabel("Status").click()
    await page.getByRole("option", { name: "Rascunho" }).click()

    await expect(page.getByRole("link", { name: SEED_PUBLISHED, exact: true })).toBeHidden()
    await expect(page.getByRole("link", { name: SEED_DRAFT, exact: true })).toBeVisible()
    // Só rascunhos: toda linha do corpo tem o selo "Rascunho".
    const bodyRows = page.getByRole("table").locator("tbody tr")
    const total = await bodyRows.count()
    expect(total).toBeGreaterThanOrEqual(1)
    await expect(bodyRows.filter({ hasText: "Rascunho" })).toHaveCount(total)
  })

  test("operador vê a lista sem o botão Nova corrida", async ({ page }) => {
    await loginAsAdmin(page, OPERATOR_EMAIL)
    await page.goto("/admin/eventos")

    await expect(page.getByRole("link", { name: SEED_PUBLISHED, exact: true })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole("link", { name: "Nova corrida" })).toHaveCount(0)
  })
})

test.describe("Admin — cadastro e publicação de corridas", () => {
  test("cria uma corrida, publica, aparece na home e despublica", async ({ page }) => {
    test.slow()
    const suffix = `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`
    const nome = `Corrida E2E ${suffix}`
    const main = page.getByRole("main")

    await loginAsAdmin(page)
    await page.goto("/admin/eventos/novo")
    await expect(page.getByRole("heading", { level: 1, name: "Nova corrida" })).toBeVisible()

    await page.getByLabel("Nome da corrida").fill(nome)
    // Slug gerado do nome enquanto não é editado à mão.
    await expect(page.getByLabel("Endereço (slug)")).toHaveValue(`corrida-e2e-${suffix}`)
    await page.getByLabel("Descrição").fill("Corrida criada pelo teste e2e do admin.")
    await page.getByLabel("Data", { exact: true }).fill("2027-05-10")
    await page.getByLabel("Horário de largada").fill("06:00")
    await page.getByLabel("Local da largada").fill("Aterrinho da Praia de Iracema")
    await page.getByRole("button", { name: "Cadastrar corrida" }).click()

    await expect(page).toHaveURL(/\/admin\/eventos\/\d+$/, { timeout: 30_000 })
    const eventUrl = page.url()
    await expect(page.getByRole("heading", { level: 1, name: nome })).toBeVisible()
    await expect(main.getByText("Rascunho", { exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: "Distâncias e lotes" })).toBeVisible()

    await page.getByRole("button", { name: "Publicar" }).click()
    await expect(main.getByText("Publicado", { exact: true })).toBeVisible({ timeout: 30_000 })

    // A action revalida a tag `events`: a home já traz a corrida nova.
    await page.goto("/")
    await expect(page.getByText(nome).first()).toBeVisible({ timeout: 30_000 })

    await page.goto(eventUrl)
    await page.getByRole("button", { name: "Despublicar" }).click()
    await expect(main.getByText("Rascunho", { exact: true })).toBeVisible({ timeout: 30_000 })

    await page.goto("/")
    await expect(page.getByRole("heading", { name: "Escolha seu próximo desafio" })).toBeVisible()
    await expect(page.getByText(nome)).toHaveCount(0)

    // Limpeza: exclusão com confirmação (o mock guarda tudo em memória entre execuções).
    await page.goto(eventUrl)
    await page.getByRole("button", { name: "Excluir" }).click()
    await expect(page.getByRole("heading", { name: "Excluir esta corrida?" })).toBeVisible()
    await page.getByRole("button", { name: "Excluir corrida" }).click()
    await expect(page).toHaveURL("/admin/eventos", { timeout: 30_000 })
    await expect(page.getByRole("link", { name: nome, exact: true })).toHaveCount(0)
  })

  test("valida o formulário em português", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/eventos/novo")

    await page.getByLabel("UF").fill("C1")
    await page.getByRole("button", { name: "Cadastrar corrida" }).click()

    await expect(page.getByText("Informe o nome da corrida")).toBeVisible()
    await expect(page.getByText("Informe a data da corrida")).toBeVisible()
    await expect(page.getByText("UF com 2 letras (ex.: CE)")).toBeVisible()
  })

  test("id inexistente ou inválido responde 404", async ({ page }) => {
    await loginAsAdmin(page)
    expect((await page.goto("/admin/eventos/999999"))?.status()).toBe(404)
    expect((await page.goto("/admin/eventos/abc"))?.status()).toBe(404)
  })

  test("operador vê a corrida só para leitura, sem ações", async ({ page }) => {
    await loginAsAdmin(page, OPERATOR_EMAIL)
    await page.goto("/admin/eventos/4")

    await expect(page.getByRole("heading", { level: 1, name: SEED_DRAFT })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText("Seu perfil tem acesso somente leitura às corridas.")).toBeVisible()
    await expect(page.getByLabel("Nome da corrida")).toBeDisabled()
    await expect(page.getByRole("button", { name: "Publicar" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Salvar alterações" })).toHaveCount(0)
  })
})
