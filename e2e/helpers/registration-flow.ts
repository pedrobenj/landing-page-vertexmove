import { expect, type Page } from "@playwright/test"

export const EVENT_SLUG = "corrida-vertex-beira-mar-2026"
export const REGISTRATION_URL = `/corridas/${EVENT_SLUG}/inscricao`
/** A primeira navegação para uma rota compila sob demanda no `next dev`: mais folga que os 5 s padrão. */
export const NAVIGATION_TIMEOUT = 20_000

export interface AthleteData {
  name: string
  birthDate: string
  cpf?: string
  whatsapp?: string
}

/** O radio do Radix fica `sr-only`; o clique vai no card (`<Label htmlFor>`) visível, como faz o atleta. */
export async function chooseOption(page: Page, text: RegExp) {
  await page.locator("label").filter({ hasText: text }).click()
}

/** Etapa 1: 5 km, Kit Básico (já vem marcado) e camisa M. */
export async function fillDistanceStep(page: Page) {
  await chooseOption(page, /^5 km/)
  await expect(page.getByRole("radio", { name: /^Kit Básico/ })).toBeChecked()
  await chooseOption(page, /^M \(Médio\)$/)
  await page.getByRole("button", { name: "Continuar" }).click()
}

export async function fillAthleteStep(page: Page, athlete: AthleteData) {
  await expect(page.getByRole("heading", { name: "Seus dados" })).toBeVisible()
  await page.getByLabel("Nome completo").fill(athlete.name)
  await page.getByLabel("Data de nascimento").fill(athlete.birthDate)
  if (athlete.cpf) await page.getByLabel("CPF").fill(athlete.cpf)
  if (athlete.whatsapp) await page.getByLabel("WhatsApp").fill(athlete.whatsapp)
  await page.getByRole("button", { name: "Continuar" }).click()
}

export async function fillTermsStep(page: Page) {
  await expect(page.getByRole("heading", { name: "Termos" })).toBeVisible()
  await page.getByRole("checkbox", { name: /regulamento da prova/ }).check()
  await page.getByRole("checkbox", { name: /termo de responsabilidade/ }).check()
  await page.getByRole("checkbox", { name: /política de privacidade/ }).check()
  await page.getByRole("button", { name: "Continuar" }).click()
}

/** Fluxo completo até a página de confirmação; devolve o código da inscrição. */
export async function registerAthlete(page: Page, athlete: AthleteData): Promise<string> {
  await page.goto(REGISTRATION_URL)
  await fillDistanceStep(page)
  await fillAthleteStep(page, athlete)
  await fillTermsStep(page)
  await expect(page.getByRole("heading", { name: "Revise sua inscrição" })).toBeVisible()
  await page.getByRole("button", { name: "Confirmar inscrição" }).click()
  await expect(page).toHaveURL("/inscricao/confirmada", { timeout: NAVIGATION_TIMEOUT })
  const code = page.getByTestId("registration-code")
  await expect(code).toHaveText(/^VX-/)
  return (await code.textContent()) ?? ""
}
