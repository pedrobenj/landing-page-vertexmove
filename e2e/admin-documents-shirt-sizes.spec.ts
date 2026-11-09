import { expect, test } from "@playwright/test"

import { loginAsAdmin, OPERATOR_EMAIL } from "./helpers/admin-login"
import { uniqueSuffix } from "./helpers/unique-suffix"

test.describe("Admin — tamanhos de camisa", () => {
  test.describe.configure({ timeout: 60_000 })

  test("cria o tamanho XXGG", async ({ page }) => {
    test.slow()
    // O mock aceita códigos repetidos e guarda tudo entre execuções: a descrição identifica esta execução.
    const descricao = `Extra extra GG ${uniqueSuffix()}`

    await loginAsAdmin(page)
    await page.getByRole("navigation", { name: "Menu do admin" }).getByRole("link", { name: "Tamanhos de camisa" }).click()
    await expect(page.getByRole("heading", { level: 1, name: "Tamanhos de camisa" })).toBeVisible()

    await page.getByRole("button", { name: "Novo tamanho" }).click()
    const dialog = page.getByRole("dialog", { name: "Novo tamanho" })
    await dialog.getByLabel("Código").fill("xxgg")
    await dialog.getByLabel("Descrição (opcional)").fill(descricao)
    await dialog.getByRole("button", { name: "Salvar tamanho" }).click()

    await expect(dialog).toBeHidden({ timeout: 20_000 })
    const row = page.getByRole("row").filter({ hasText: descricao })
    // Em 360px a descrição fica escondida na tabela: confere pelo DOM.
    await expect(row).toHaveCount(1)
    await expect(row.getByRole("cell").first()).toHaveText("XXGG")
  })

  test("operador vê os tamanhos sem cadastro", async ({ page }) => {
    await loginAsAdmin(page, OPERATOR_EMAIL)
    await page.goto("/admin/tamanhos-camisa")
    await expect(page.getByText("Seu perfil tem acesso somente leitura aos tamanhos.")).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole("button", { name: "Novo tamanho" })).toHaveCount(0)
  })
})

test.describe("Admin — documentos", () => {
  test.describe.configure({ timeout: 60_000 })

  test("publica uma nova versão do regulamento", async ({ page }) => {
    test.slow()
    const titulo = `Regulamento E2E ${uniqueSuffix()}`

    await loginAsAdmin(page)
    await page.goto("/admin/eventos/4/documentos")
    await expect(page.getByRole("heading", { level: 1, name: "Documentos" })).toBeVisible()
    await expect(page.getByText("Documentos são imutáveis; publique uma nova versão.")).toBeVisible()
    // Sem edição nem exclusão.
    await expect(page.getByRole("button", { name: /Editar|Excluir/ })).toHaveCount(0)

    await page.getByRole("button", { name: "Nova versão: Regulamento" }).click()
    const dialog = page.getByRole("dialog", { name: "Nova versão do documento" })
    await expect(dialog.getByRole("radio", { name: "Regulamento" })).toBeChecked()
    await dialog.getByLabel("Versão", { exact: true }).fill("9.9")
    await dialog.getByLabel("Vale a partir de").fill("2026-01-01T00:00")
    await dialog.getByLabel("Título").fill(titulo)
    await dialog.getByLabel("URL do arquivo (PDF)").fill("https://cdn.example.com/regulamento-e2e.pdf")
    await dialog.getByLabel("Hash SHA-256 do arquivo").fill("123")
    await dialog.getByRole("button", { name: "Publicar nova versão" }).click()
    await expect(dialog.getByText("O hash SHA-256 tem 64 caracteres (0-9 e a-f)")).toBeVisible()

    await dialog.getByLabel("Hash SHA-256 do arquivo").fill("AB".repeat(32))
    await dialog.getByRole("button", { name: "Publicar nova versão" }).click()

    const regulation = page.getByRole("region", { name: "Regulamento" })
    const item = regulation.getByRole("listitem").filter({ hasText: titulo })
    await expect(item).toBeVisible({ timeout: 20_000 })
    await expect(item.getByText("v9.9")).toBeVisible()
    await expect(item.getByText(`SHA-256 ${"ab".repeat(32)}`)).toBeVisible()
  })
})
