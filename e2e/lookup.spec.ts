import { expect, test } from "@playwright/test"

import { chooseOption, registerAthlete } from "./helpers/registration-flow"
import { generateValidCpf, generateWhatsapp } from "./helpers/test-data"

test.describe("Consulta de inscrição", () => {
  test("encontra a inscrição pelo CPF e mostra só o nome mascarado", async ({ page }) => {
    test.slow()
    const cpf = generateValidCpf()
    await registerAthlete(page, { name: "Carla Mendes Lima", birthDate: "22/07/1992", cpf, whatsapp: generateWhatsapp() })

    await page.goto("/consulta")
    await chooseOption(page, /^CPF$/)
    await page.getByLabel("CPF usado na inscrição").fill(cpf)
    await page.getByRole("button", { name: "Consultar" }).click()

    const result = page.getByRole("article", { name: /Corrida Vertex Beira-Mar 2026 — 5 km/ })
    await expect(result).toBeVisible()
    await expect(result.getByText("Carla L****")).toBeVisible()
    await expect(result.getByText("Pendente")).toBeVisible()
    await expect(page.getByText("Mendes")).toHaveCount(0)
  })

  test("vê a inscrição e baixa o comprovante após confirmar a data de nascimento", async ({ page }) => {
    test.slow()
    const cpf = generateValidCpf()
    await registerAthlete(page, { name: "Rita Souza Lima", birthDate: "14/03/1988", cpf, whatsapp: generateWhatsapp() })

    await page.goto("/consulta")
    await chooseOption(page, /^CPF$/)
    await page.getByLabel("CPF usado na inscrição").fill(cpf)
    await page.getByRole("button", { name: "Consultar" }).click()
    await page.getByRole("button", { name: /^Ver inscrição: Corrida Vertex Beira-Mar 2026/ }).click()

    const dialog = page.getByRole("dialog", { name: "Sua inscrição" })
    await dialog.getByLabel("Data de nascimento do atleta").fill("15031988")
    await dialog.getByRole("button", { name: "Ver inscrição" }).click()
    await expect(dialog.getByText("A data de nascimento não confere com a inscrição.", { exact: false })).toBeVisible()

    await dialog.getByLabel("Data de nascimento do atleta").fill("14031988")
    await dialog.getByRole("button", { name: "Ver inscrição" }).click()
    await expect(dialog.getByTestId("receipt-code")).toHaveText(/^VX-\d{4}-\d{8}$/)
    await expect(dialog.getByText("Rita Souza Lima")).toBeVisible()
    await expect(dialog.getByText("Kit Camisa + Medalha")).toBeVisible()

    const downloadPromise = page.waitForEvent("download")
    await dialog.getByRole("button", { name: "Baixar comprovante (PDF)" }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/^comprovante-VX-\d{4}-\d{8}\.pdf$/)
  })

  test("encontra a inscrição pelo WhatsApp", async ({ page }) => {
    test.slow()
    const whatsapp = generateWhatsapp()
    await registerAthlete(page, { name: "Pedro Alves", birthDate: "05/05/1980", whatsapp })

    await page.goto("/consulta")
    await page.getByLabel("WhatsApp usado na inscrição").fill(whatsapp)
    await page.getByRole("button", { name: "Consultar" }).click()
    await expect(page.getByText("1 inscrição encontrada")).toBeVisible()
    await expect(page.getByText("Pedro A****")).toBeVisible()
  })

  test("CPF inválido mostra a mensagem de validação", async ({ page }) => {
    await page.goto("/consulta")
    await chooseOption(page, /^CPF$/)
    await page.getByLabel("CPF usado na inscrição").fill("111.111.111-11")
    await page.getByRole("button", { name: "Consultar" }).click()
    await expect(page.getByText("CPF inválido")).toBeVisible()
  })

  test("CPF sem inscrições mostra o estado vazio", async ({ page }) => {
    await page.goto("/consulta")
    await chooseOption(page, /^CPF$/)
    await page.getByLabel("CPF usado na inscrição").fill(generateValidCpf())
    await page.getByRole("button", { name: "Consultar" }).click()
    await expect(page.getByText("Nenhuma inscrição encontrada para os dados informados.")).toBeVisible()
    await expect(page.getByRole("link", { name: "Ver corridas" })).toBeVisible()
  })
})
