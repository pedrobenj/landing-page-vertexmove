import { expect, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/admin-login"
import { uniqueSuffix } from "./helpers/unique-suffix"

test.describe("Admin — kits", () => {
  test.describe.configure({ timeout: 60_000 })

  test("cria um kit com uma foto na corrida em rascunho", async ({ page }) => {
    test.slow()
    const nome = `Kit E2E ${uniqueSuffix()}`

    await loginAsAdmin(page)
    await page.goto("/admin/eventos/4/kits")
    await expect(page.getByRole("heading", { level: 1, name: "Kits" })).toBeVisible()

    await page.getByRole("button", { name: "Novo kit" }).click()
    const dialog = page.getByRole("dialog", { name: "Novo kit" })
    await dialog.getByLabel("Nome do kit").fill(nome)
    await dialog.getByLabel("O que vem no kit (opcional)").fill("Camisa, medalha e número de peito.")
    await dialog.getByLabel("Preço do kit (R$)").fill("50,00")
    await dialog.getByRole("button", { name: "Adicionar foto" }).click()
    await dialog.getByLabel("URL da foto").fill("foto-sem-protocolo.jpg")
    await dialog.getByLabel("Descrição da foto").fill("Camisa oficial azul")
    await dialog.getByRole("button", { name: "Salvar kit" }).click()
    await expect(dialog.getByText("Informe uma URL válida, começando com https://")).toBeVisible()

    await dialog.getByLabel("URL da foto").fill("https://cdn.example.com/kits/camisa.jpg")
    await dialog.getByRole("button", { name: "Salvar kit" }).click()

    const card = page.getByRole("article", { name: nome })
    await expect(card).toBeVisible({ timeout: 20_000 })
    await expect(card.getByText("1 foto")).toBeVisible()
    await expect(card.getByText("+ R$ 50,00")).toBeVisible()
    await expect(card.getByRole("link", { name: /Camisa oficial azul/ })).toHaveAttribute(
      "href",
      "https://cdn.example.com/kits/camisa.jpg",
    )

    // Edição traz a foto salva; uma segunda foto sobe para o 1º lugar (a ordem é a posição na lista).
    await card.getByRole("button", { name: `Editar kit ${nome}` }).click()
    const editDialog = page.getByRole("dialog", { name: `Editar ${nome}` })
    await expect(editDialog.getByLabel("Descrição da foto")).toHaveValue("Camisa oficial azul")
    await editDialog.getByRole("button", { name: "Adicionar foto" }).click()
    await editDialog.getByLabel("URL da foto").nth(1).fill("https://cdn.example.com/kits/medalha.jpg")
    await editDialog.getByLabel("Descrição da foto").nth(1).fill("Medalha de finisher")
    await editDialog.getByRole("button", { name: "Subir foto 2" }).click()
    await expect(editDialog.getByLabel("Descrição da foto").first()).toHaveValue("Medalha de finisher")
    await editDialog.getByRole("button", { name: "Salvar kit" }).click()

    await expect(card.getByText("2 fotos")).toBeVisible({ timeout: 20_000 })
    await expect(card.getByRole("link")).toHaveText([/Medalha de finisher/, /Camisa oficial azul/])
  })
})
