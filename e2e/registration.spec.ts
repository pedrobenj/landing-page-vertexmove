import { expect, test } from "@playwright/test"

import {
  fillAthleteStep,
  fillDistanceStep,
  fillTermsStep,
  NAVIGATION_TIMEOUT,
  REGISTRATION_URL,
  registerAthlete,
} from "./helpers/registration-flow"
import { generateValidCpf, generateWhatsapp } from "./helpers/test-data"

test.describe("Inscrição em etapas", () => {
  test.slow()

  test("fluxo completo até a confirmação com o código VX-", async ({ page }) => {
    const cpf = generateValidCpf()
    await page.goto(REGISTRATION_URL)
    await expect(page.getByRole("heading", { level: 1, name: "Corrida Vertex Beira-Mar 2026" })).toBeVisible()
    await expect(page.getByRole("navigation", { name: "Etapas da inscrição" })).toBeVisible()

    await fillDistanceStep(page)
    await fillAthleteStep(page, { name: "Maria da Silva", birthDate: "06/12/1990", cpf, whatsapp: generateWhatsapp() })
    await fillTermsStep(page)

    await expect(page.getByRole("heading", { name: "Revise sua inscrição" })).toBeVisible()
    await expect(page.getByText("5 km", { exact: true })).toBeVisible()
    await expect(page.getByText("Kit Básico", { exact: true })).toBeVisible()
    await expect(page.getByText(`***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`)).toBeVisible()
    await expect(page.getByText("R$ 89,90")).toBeVisible()
    await expect(page.getByText(/O valor final é confirmado após o envio/)).toBeVisible()

    await page.getByRole("button", { name: "Confirmar inscrição" }).click()
    await expect(page).toHaveURL("/inscricao/confirmada", { timeout: NAVIGATION_TIMEOUT })
    await expect(page.getByRole("heading", { level: 1, name: "Inscrição realizada!" })).toBeVisible()
    await expect(page.getByTestId("registration-code")).toHaveText(/^VX-\d{4}-\d{8}$/)
    await expect(page.getByText("Status: Pendente")).toBeVisible()
    await expect(page.getByText("R$ 89,90").first()).toBeVisible()
  })

  test("exige a distância e o CPF ou o WhatsApp", async ({ page }) => {
    await page.goto(REGISTRATION_URL)
    await page.getByRole("button", { name: "Continuar" }).click()
    await expect(page.getByRole("alert").filter({ hasText: "Escolha a distância" })).toBeVisible()
    // O foco vai para o primeiro rádio disponível (o grupo em si não é focável).
    await expect(page.getByRole("radio", { name: /^5 km/ })).toBeFocused()

    await fillDistanceStep(page)
    await fillAthleteStep(page, { name: "Maria da Silva", birthDate: "06/12/1990" })
    await expect(page.getByRole("alert").filter({ hasText: "Informe o CPF ou o WhatsApp" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Seus dados" })).toBeVisible()
  })

  test("atleta menor de 18 na data da prova exige a confirmação do responsável legal", async ({ page }) => {
    await page.goto(REGISTRATION_URL)
    await fillDistanceStep(page)
    // A prova é em 06/12/2026: quem nasceu em 07/12/2008 ainda tem 17 anos.
    await fillAthleteStep(page, { name: "Lucas Andrade", birthDate: "07/12/2008", whatsapp: generateWhatsapp() })

    const guardian = page.getByRole("checkbox", { name: /Sou o responsável legal ou tenho autorização dele/ })
    await expect(page.getByText("Atleta menor de 18 anos na data da prova")).toBeVisible()
    await expect(page.getByRole("alert").filter({ hasText: "Confirme que você é o responsável legal" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Seus dados" })).toBeVisible()

    await guardian.check()
    await page.getByRole("button", { name: "Continuar" }).click()
    await expect(page.getByRole("heading", { name: "Termos" })).toBeVisible()

    // Maior de idade na data da prova: o aviso some.
    await page.getByRole("button", { name: "Voltar" }).click()
    await page.getByLabel("Data de nascimento").fill("06/12/2008")
    await expect(guardian).toBeHidden()
  })

  test("reenviar o mesmo CPF mostra o aviso de duplicata com link para a consulta", async ({ page }) => {
    const athlete = { name: "João Pereira", birthDate: "10/03/1985", cpf: generateValidCpf(), whatsapp: generateWhatsapp() }
    await registerAthlete(page, athlete)

    await page.goto(REGISTRATION_URL)
    await fillDistanceStep(page)
    await fillAthleteStep(page, athlete)
    await fillTermsStep(page)
    await page.getByRole("button", { name: "Confirmar inscrição" }).click()

    await expect(page.getByText("Já existe uma inscrição para este atleta nesta distância.")).toBeVisible()
    await page.getByRole("button", { name: "Consultar inscrição" }).click()
    await expect(page).toHaveURL("/consulta", { timeout: NAVIGATION_TIMEOUT })
  })

  test("recarregar no meio do formulário mantém a etapa e os dados", async ({ page }) => {
    await page.goto(REGISTRATION_URL)
    await fillDistanceStep(page)
    await fillAthleteStep(page, { name: "Ana Souza", birthDate: "01/01/1995", whatsapp: generateWhatsapp() })
    await expect(page.getByRole("heading", { name: "Termos" })).toBeVisible()

    await page.reload()
    await expect(page.getByRole("heading", { name: "Termos" })).toBeVisible()
    await page.getByRole("button", { name: "Voltar" }).click()
    await expect(page.getByLabel("Nome completo")).toHaveValue("Ana Souza")
    await page.getByRole("button", { name: "Voltar" }).click()
    await expect(page.getByRole("radio", { name: /^5 km/ })).toBeChecked()
    await expect(page.getByRole("radio", { name: "M (Médio)" })).toBeChecked()
  })

  test("envia Referrer-Policy: no-referrer", async ({ request }) => {
    const response = await request.get(REGISTRATION_URL)
    expect(response.headers()["referrer-policy"]).toBe("no-referrer")
  })
})
