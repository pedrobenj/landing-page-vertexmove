import { readFile } from "node:fs/promises"

import { expect, test } from "@playwright/test"

import { ATHLETE_NAME, cancelRegistration, createPaidRegistration, openRegistration, REGISTRATIONS_URL, searchRegistration } from "./helpers/admin-registrations"
import { loginAsAdmin, OPERATOR_EMAIL } from "./helpers/admin-login"
import { NAVIGATION_TIMEOUT } from "./helpers/registration-flow"

test.describe("Admin: inscrições da corrida", () => {
  test.describe.configure({ timeout: 120_000 })

  test("a seção Inscrições da corrida leva à lista", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/eventos/1")
    await page.getByRole("link", { name: "Inscrições" }).click()
    await expect(page).toHaveURL(REGISTRATIONS_URL, { timeout: NAVIGATION_TIMEOUT })
    await expect(page.getByRole("heading", { level: 1, name: "Inscrições" })).toBeVisible()
  })

  test("lista paginada com filtros de status, distância e busca", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto(REGISTRATIONS_URL)
    await expect(page.getByRole("link", { name: "Ver inscrição VX-2026-00000024" })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const pagination = page.getByRole("navigation", { name: "Paginação de inscrições" })
    await pagination.getByRole("button", { name: /Próxima/ }).click()
    await expect(pagination.getByRole("button", { name: /Anterior/ })).toBeEnabled()
    await pagination.getByRole("button", { name: /Anterior/ }).click()

    // Nome: trecho com acento (ILIKE no backend); código: exato.
    await page.getByLabel("Buscar").fill("Maria das Graças")
    await expect(page.getByRole("link", { name: "Ver inscrição VX-2026-00000024" })).toBeVisible()
    await expect(page.getByRole("link", { name: /^Ver inscrição/ })).toHaveCount(1)

    await page.getByLabel("Buscar").fill("")
    await page.getByLabel("Status").click()
    await page.getByRole("option", { name: "Estornada" }).click()
    await expect(page.getByRole("link", { name: "Ver inscrição VX-2026-00000023" })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await page.getByLabel("Status").click()
    await page.getByRole("option", { name: "Todos" }).click()
    await page.getByLabel("Distância").click()
    await page.getByRole("option", { name: "Caminhada 3 km" }).click()
    await page.getByLabel("Buscar").fill("VX-2026-00000001")
    await expect(page.getByText("Nenhuma inscrição com estes filtros.")).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  })

  test("marca e desfaz a retirada, abre o detalhe com o contato e cancela com confirmação dupla", async ({ page }) => {
    const code = await createPaidRegistration(page)
    await loginAsAdmin(page)
    await searchRegistration(page, code)

    await page.getByRole("button", { name: `Marcar retirada de ${ATHLETE_NAME}` }).click()
    await page.getByRole("dialog", { name: "Registrar a retirada do kit?" }).getByRole("button", { name: "Registrar retirada" }).click()
    await expect(page.getByText("Retirada do kit registrada")).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page.getByRole("button", { name: `Desfazer retirada de ${ATHLETE_NAME}` })).toBeVisible()

    await page.getByRole("button", { name: `Desfazer retirada de ${ATHLETE_NAME}` }).click()
    await page.getByRole("dialog", { name: "Desfazer a retirada do kit?" }).getByRole("button", { name: "Desfazer retirada" }).click()
    await expect(page.getByText("Retirada do kit desfeita")).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await openRegistration(page, code)
    const athlete = page.getByRole("region", { name: "Atleta" })
    await expect(athlete.getByText(ATHLETE_NAME)).toBeVisible()
    await expect(athlete.getByText("15/08/1992")).toBeVisible()
    await expect(athlete.getByText(/^\(85\) 9/)).toBeVisible()
    await expect(page.getByRole("region", { name: "Pagamentos" }).getByText("Aprovado")).toBeVisible()

    // Sem motivo não avança; voltar no 2º passo não cancela.
    await page.getByRole("button", { name: "Cancelar inscrição" }).click()
    const first = page.getByRole("dialog", { name: "Cancelar esta inscrição?" })
    await expect(first.getByRole("button", { name: "Continuar" })).toBeDisabled()
    await first.getByLabel("Motivo do cancelamento").fill("Teste")
    await first.getByRole("button", { name: "Continuar" }).click()
    await page.getByRole("dialog", { name: "Tem certeza?" }).getByRole("button", { name: "Voltar" }).click()
    await expect(page.getByRole("dialog", { name: "Cancelar esta inscrição?" })).toBeVisible()
    await page.keyboard.press("Escape")

    await cancelRegistration(page)
    await expect(page.getByRole("region", { name: code }).getByText("Cancelada", { exact: true })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page.getByRole("button", { name: "Cancelar inscrição" })).toHaveCount(0)
  })

  test("exporta o CSV pelo servidor do Next", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto(REGISTRATIONS_URL)
    const downloadPromise = page.waitForEvent("download")
    await page.getByRole("link", { name: "Exportar CSV" }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe("inscritos-evento-1.csv")
    const content = await readFile((await download.path())!, "utf8")
    expect(content.replace(/^﻿/, "").split("\r\n")[0]).toBe("Código;Nome;Distância;Kit;Tamanho;Status;WhatsApp;E-mail;Nascimento;Kit retirado em")
    expect(content).toContain("VX-2026-00000001;Ana Beatriz Lima;")
  })

  test("operador vê a lista sem as ações", async ({ page }) => {
    await loginAsAdmin(page, OPERATOR_EMAIL)
    await page.goto(REGISTRATIONS_URL)
    await expect(page.getByRole("link", { name: "Ver inscrição VX-2026-00000024" })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page.getByRole("button", { name: /Marcar retirada/ })).toHaveCount(0)
  })

  test("inscrição de outra corrida pela URL retorna 404", async ({ page }) => {
    await loginAsAdmin(page)
    const response = await page.goto("/admin/eventos/2/inscricoes/1")
    expect(response?.status()).toBe(404)
  })
})
