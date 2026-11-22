import { expect, type Page } from "@playwright/test"

import { NAVIGATION_TIMEOUT, registerAthlete } from "./registration-flow"
import { generateValidCpf, generateWhatsapp } from "./test-data"

export const ATHLETE_NAME = "Renata Teixeira Admin"
export const REGISTRATIONS_URL = "/admin/eventos/1/inscricoes"

/**
 * Inscrição nova e paga (checkout simulado do mock), para cada teste ter a sua: o mock guarda tudo em
 * memória no `next dev` e os projetos desktop e mobile rodam em paralelo.
 */
export async function createPaidRegistration(page: Page): Promise<string> {
  const code = await registerAthlete(page, { name: ATHLETE_NAME, birthDate: "15/08/1992", cpf: generateValidCpf(), whatsapp: generateWhatsapp() })
  await page.getByRole("button", { name: "Ir para o pagamento" }).click()
  await expect(page).toHaveURL(`/dev/checkout-pro/${code}`, { timeout: NAVIGATION_TIMEOUT })
  await page.getByRole("button", { name: /Aprovar pagamento/ }).click()
  await expect(page.getByRole("heading", { name: "Pagamento confirmado!" })).toBeVisible({ timeout: 30_000 })
  return code.trim()
}

/** Abre os inscritos da corrida 1 e busca pelo código (o campo tem debounce). */
export async function searchRegistration(page: Page, code: string) {
  await page.goto(REGISTRATIONS_URL)
  await expect(page.getByRole("heading", { level: 1, name: "Inscrições" })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  await page.getByLabel("Buscar").fill(code)
  await expect(page.getByRole("link", { name: `Ver inscrição ${code}` })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
}

/** Abre o detalhe da inscrição pela lista. */
export async function openRegistration(page: Page, code: string) {
  await searchRegistration(page, code)
  await page.getByRole("link", { name: `Ver inscrição ${code}` }).click()
  await expect(page.getByRole("heading", { level: 1, name: code })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
}

/** Cancela pelo detalhe, com motivo e a confirmação dupla. */
export async function cancelRegistration(page: Page) {
  await page.getByRole("button", { name: "Cancelar inscrição" }).click()
  const first = page.getByRole("dialog", { name: "Cancelar esta inscrição?" })
  await expect(first).toContainText("estorno entra na fila")
  await first.getByLabel("Motivo do cancelamento").fill("Pedido do atleta")
  await first.getByRole("button", { name: "Continuar" }).click()
  const second = page.getByRole("dialog", { name: "Tem certeza?" })
  await expect(second).toBeVisible()
  await second.getByRole("button", { name: "Cancelar e sinalizar estorno" }).click()
  await expect(page.getByText("Inscrição cancelada; o estorno foi sinalizado")).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
}
