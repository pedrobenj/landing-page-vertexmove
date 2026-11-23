import { readFile } from "node:fs/promises"

import { expect, type Page, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/admin-login"
import { NAVIGATION_TIMEOUT, registerAthlete } from "./helpers/registration-flow"
import { generateValidCpf, generateWhatsapp } from "./helpers/test-data"
import { uniqueSuffix } from "./helpers/unique-suffix"

const FORM_URL = "/privacidade/solicitacao"

function formatCpf(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

/** Preenche e envia o formulário do titular; devolve o protocolo exibido. */
async function submitRequest(page: Page, { name, cpf, type }: { name: string; cpf: string; type: string }): Promise<string> {
  await page.goto(FORM_URL)
  await page.getByRole("combobox", { name: "O que você quer pedir?" }).click()
  await page.getByRole("option", { name: type }).click()
  await page.getByLabel("Nome completo").fill(name)
  await page.getByLabel("CPF do titular").fill(cpf)
  await page.getByLabel("E-mail").fill("titular.e2e@example.com")
  await page.getByLabel("Mensagem (opcional)").fill("Pedido feito pelo teste E2E.")
  await page.getByLabel(/Declaro que sou o titular/).check()
  await page.getByRole("button", { name: "Enviar solicitação" }).click()
  await expect(page.getByRole("heading", { name: "Solicitação recebida" })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
  const protocol = (await page.getByText(/^LGPD-\d{4}-[0-9A-Z]{8}$/).textContent()) ?? ""
  expect(protocol).toMatch(/^LGPD-/)
  return protocol
}

async function openRequest(page: Page, protocol: string) {
  await page.goto("/admin/lgpd")
  await page.getByRole("link", { name: `Ver solicitação ${protocol}` }).click()
  await expect(page.getByRole("heading", { level: 1, name: protocol })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
}

test.describe("LGPD — solicitação do titular", () => {
  test.describe.configure({ timeout: 120_000 })

  test("a política de privacidade leva ao formulário", async ({ page }) => {
    await page.goto("/privacidade")
    await page.getByRole("link", { name: "Fazer uma solicitação" }).click()
    await expect(page).toHaveURL(FORM_URL, { timeout: NAVIGATION_TIMEOUT })
    await expect(page.getByRole("heading", { level: 1, name: "Solicitação sobre seus dados" })).toBeVisible()
  })

  test("valida os campos antes de enviar", async ({ page }) => {
    await page.goto(FORM_URL)
    await page.getByRole("button", { name: "Enviar solicitação" }).click()
    await expect(page.getByText("Escolha o tipo de solicitação").last()).toBeVisible()
    await expect(page.getByText("Informe o nome completo")).toBeVisible()
    await expect(page.getByText("CPF inválido")).toBeVisible()
    await expect(page.getByText("Informe um e-mail ou um WhatsApp para a resposta")).toBeVisible()
    await expect(page.getByText(/Confirme que você é o titular/)).toBeVisible()
  })

  test("envia e mostra só o protocolo, sem revelar se o CPF tem cadastro", async ({ page }) => {
    await submitRequest(page, { name: "Pessoa Sem Cadastro", cpf: formatCpf(generateValidCpf()), type: "Acesso aos dados" })
    await expect(page.getByText(/responder pelo contato informado até/)).toBeVisible()
    await expect(page.getByText(/não encontramos|não há cadastro|sem cadastro/i)).toHaveCount(0)
  })

  test("admin: lista, atende com resposta, exporta e anonimiza com confirmação dupla", async ({ page }) => {
    test.slow()
    const cpf = generateValidCpf()
    const name = `Titular Lgpd ${uniqueSuffix()}`
    await registerAthlete(page, { name, birthDate: "10/05/1990", cpf, whatsapp: generateWhatsapp() })
    const protocol = await submitRequest(page, { name, cpf: formatCpf(cpf), type: "Eliminação dos dados" })

    await loginAsAdmin(page)
    await page.getByRole("navigation", { name: "Menu do admin" }).getByRole("link", { name: "LGPD" }).click()
    await expect(page.getByRole("heading", { level: 1, name: "Solicitações LGPD" })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await page.getByRole("combobox", { name: "Tipo" }).click()
    await page.getByRole("option", { name: "Eliminação dos dados" }).click()
    await expect(page.getByRole("link", { name: `Ver solicitação ${protocol}` })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    await openRequest(page, protocol)
    await expect(page.getByText(formatCpf(cpf))).toBeVisible()
    await expect(page.getByText("Há inscrições com este CPF.")).toBeVisible()

    // Concluída sem resposta: o formulário recusa.
    await page.getByRole("combobox", { name: "Status" }).click()
    await page.getByRole("option", { name: "Concluída" }).click()
    await page.getByRole("button", { name: "Salvar atendimento" }).click()
    await expect(page.getByText("Escreva a resposta enviada ao titular")).toBeVisible()
    await page.getByLabel("Resposta ao titular").fill("Dados exportados e anonimizados; avisamos por e-mail.")
    await page.getByRole("button", { name: "Salvar atendimento" }).click()
    await expect(page.getByText("Solicitação atualizada")).toBeVisible({ timeout: NAVIGATION_TIMEOUT })

    const downloadPromise = page.waitForEvent("download")
    await page.getByRole("link", { name: "Exportar dados (JSON)" }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe(`titular-${protocol}.json`)
    const content = await readFile((await download.path())!, "utf8")
    const exported = JSON.parse(content) as { atletas: { nomeCompleto: string }[]; inscricoes: unknown[] }
    expect(exported.atletas[0]?.nomeCompleto).toBe(name)
    expect(exported.inscricoes.length).toBeGreaterThan(0)
    expect(content).not.toContain(cpf)

    await page.getByRole("button", { name: "Anonimizar titular" }).click()
    const first = page.getByRole("dialog", { name: "Anonimizar os dados deste titular?" })
    await expect(first.getByText(/serão apagados de todas as inscrições/)).toBeVisible()
    await first.getByRole("button", { name: "Continuar" }).click()
    const second = page.getByRole("dialog", { name: "Esta ação é irreversível" })
    await second.getByRole("button", { name: "Anonimizar definitivamente" }).click()
    await expect(page.getByText("Dados do titular anonimizados")).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page.getByText("Os dados deste titular já foram anonimizados.")).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page.getByRole("button", { name: "Anonimizar titular" })).toHaveCount(0)
  })
})
