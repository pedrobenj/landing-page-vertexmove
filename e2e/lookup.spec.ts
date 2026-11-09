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
