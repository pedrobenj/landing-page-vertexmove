import { expect, type Page } from "@playwright/test"

import { uniqueSuffix } from "./unique-suffix"

/** Cadastra uma corrida em rascunho pelo formulário do admin e devolve nome, id e URL da edição. */
export async function createDraftEvent(page: Page, prefix = "Corrida E2E") {
  const nome = `${prefix} ${uniqueSuffix()}`
  await page.goto("/admin/eventos/novo")
  await page.getByLabel("Nome da corrida").fill(nome)
  await page.getByLabel("Descrição").fill("Corrida criada pelo teste e2e do admin.")
  await page.getByLabel("Data", { exact: true }).fill("2027-05-10")
  await page.getByLabel("Horário de largada").fill("06:00")
  await page.getByLabel("Local da largada").fill("Aterrinho da Praia de Iracema")
  await page.getByRole("button", { name: "Cadastrar corrida" }).click()
  await expect(page).toHaveURL(/\/admin\/eventos\/\d+$/, { timeout: 30_000 })
  const url = page.url()
  const id = Number(url.split("/").at(-1))
  return { nome, id, url }
}

/** Exclui a corrida pela página de edição (com confirmação). Precisa estar em rascunho. */
export async function deleteEvent(page: Page, url: string) {
  await page.goto(url)
  await page.getByRole("button", { name: "Excluir" }).click()
  await page.getByRole("button", { name: "Excluir corrida" }).click()
  await expect(page).toHaveURL("/admin/eventos", { timeout: 30_000 })
}
