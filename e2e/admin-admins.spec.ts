import { type Browser, expect, type Page, test } from "@playwright/test"

import { loginAsAdmin, submitAdminLogin } from "./helpers/admin-login"
import { uniqueSuffix } from "./helpers/unique-suffix"

const ADMINS_URL = "/admin/admins"
// Primeira compilação de cada rota no `next dev` passa dos 5 s padrão.
const NAVIGATION = { timeout: 30_000 }

/** Cria um admin pelo diálogo e devolve a senha temporária mostrada uma vez. */
async function createAdmin(page: Page, name: string, email: string): Promise<string> {
  await page.goto(ADMINS_URL)
  await page.getByRole("button", { name: "Novo admin" }).click()
  const dialog = page.getByRole("dialog", { name: "Novo admin" })
  await dialog.getByLabel("Nome").fill(name)
  await dialog.getByLabel("E-mail").fill(email)
  await dialog.getByRole("button", { name: "Criar admin" }).click()
  await expect(dialog.getByText("Esta senha não será mostrada de novo. Copie agora.")).toBeVisible(NAVIGATION)
  const password = (await dialog.getByTestId("temporary-password").textContent())?.trim() ?? ""
  expect(password).toMatch(/^[A-Za-z0-9_-]{24}$/)
  await dialog.getByRole("button", { name: "Já copiei" }).click()
  await expect(dialog).toBeHidden()
  return password
}

async function loginInNewContext(browser: Browser, email: string, password: string): Promise<Page> {
  const page = await (await browser.newContext()).newPage()
  await submitAdminLogin(page, email, password)
  return page
}

// Cria contas no mock em memória (ou no banco real): e-mail com sufixo único.
test.describe("Admin — gestão de admins", () => {
  test.describe.configure({ timeout: 120_000 })

  test("cria com senha temporária, desativa (barra o login), reativa e redefine a senha", async ({ page, browser }) => {
    const suffix = uniqueSuffix()
    const name = `Admin E2E ${suffix}`
    const email = `e2e-${suffix}@example.com`

    await loginAsAdmin(page)
    await page.getByRole("navigation", { name: "Menu do admin" }).getByRole("link", { name: "Admins" }).click()
    await expect(page.getByRole("heading", { level: 1, name: "Admins" })).toBeVisible(NAVIGATION)
    // A própria conta não tem ações de gestão: troca a senha em Minha conta.
    await expect(page.getByRole("row").filter({ hasText: "Você" }).getByRole("link", { name: "Trocar minha senha" })).toBeVisible()

    const temporary = await createAdmin(page, name, email)
    const row = page.getByRole("row").filter({ hasText: email })
    await expect(row.getByText("Nunca entrou")).toBeVisible(NAVIGATION)

    const newcomer = await loginInNewContext(browser, email, temporary)
    await expect(newcomer).toHaveURL("/admin", NAVIGATION)

    await row.getByRole("button", { name: `Desativar ${name}` }).click()
    await page.getByRole("button", { name: "Desativar", exact: true }).click()
    await expect(row.getByText("Desativado", { exact: true })).toBeVisible(NAVIGATION)
    const blocked = await loginInNewContext(browser, email, temporary)
    await expect(blocked.getByText("E-mail ou senha inválidos.")).toBeVisible(NAVIGATION)

    await row.getByRole("button", { name: `Reativar ${name}` }).click()
    await expect(row.getByText("Ativo", { exact: true })).toBeVisible(NAVIGATION)

    await row.getByRole("button", { name: `Redefinir senha de ${name}` }).click()
    await page.getByRole("button", { name: "Redefinir senha", exact: true }).click()
    const dialog = page.getByRole("dialog", { name: `Nova senha de ${name}` })
    const reset = (await dialog.getByTestId("temporary-password").textContent())?.trim() ?? ""
    expect(reset).toMatch(/^[A-Za-z0-9_-]{24}$/)
    expect(reset).not.toBe(temporary)
    await dialog.getByRole("button", { name: "Já copiei" }).click()
    await expect(dialog).toBeHidden()
    // Deixa a conta de teste desativada (o backend não exclui admins).
    await row.getByRole("button", { name: `Desativar ${name}` }).click()
    await page.getByRole("button", { name: "Desativar", exact: true }).click()
    await expect(row.getByText("Desativado", { exact: true })).toBeVisible(NAVIGATION)
  })

  test("novo admin troca a própria senha e volta ao login com aviso", async ({ page, browser }) => {
    const suffix = uniqueSuffix()
    const email = `e2e-conta-${suffix}@example.com`
    const newPassword = `Senha nova E2E ${suffix}`

    await loginAsAdmin(page)
    const temporary = await createAdmin(page, `Conta E2E ${suffix}`, email)

    const own = await loginInNewContext(browser, email, temporary)
    await expect(own).toHaveURL("/admin", NAVIGATION)
    await own.goto("/admin/conta")
    await expect(own.getByRole("heading", { level: 1, name: "Minha conta" })).toBeVisible(NAVIGATION)
    await expect(own.getByText(email)).toBeVisible()

    await own.getByLabel("Senha atual").fill("senha-errada-qualquer")
    await own.getByLabel("Nova senha", { exact: true }).fill(newPassword)
    await own.getByLabel("Confirme a nova senha").fill(newPassword)
    await own.getByRole("button", { name: "Trocar senha" }).click()
    await expect(own.getByText("A senha atual não confere.").first()).toBeVisible(NAVIGATION)

    await own.getByLabel("Senha atual").fill(temporary)
    await own.getByRole("button", { name: "Trocar senha" }).click()
    await expect(own).toHaveURL("/admin/login?senha-alterada=1", NAVIGATION)
    await expect(own.getByText("Senha alterada. Entre de novo com a senha nova.")).toBeVisible()
    expect((await own.context().cookies()).map((cookie) => cookie.name)).not.toContain("vm_admin_at")

    await submitAdminLogin(own, email, newPassword)
    await expect(own).toHaveURL("/admin", NAVIGATION)

    // Limpeza: desativa a conta de teste.
    await page.goto(ADMINS_URL)
    const row = page.getByRole("row").filter({ hasText: email })
    await row.getByRole("button", { name: /^Desativar / }).click()
    await page.getByRole("button", { name: "Desativar", exact: true }).click()
    await expect(row.getByText("Desativado", { exact: true })).toBeVisible(NAVIGATION)
  })

  test("valida o formulário de troca de senha em português", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/conta")
    await expect(page.getByRole("heading", { level: 1, name: "Minha conta" })).toBeVisible(NAVIGATION)
    await page.getByLabel("Nova senha", { exact: true }).fill("curta")
    await page.getByLabel("Confirme a nova senha").fill("outra")
    await page.getByRole("button", { name: "Trocar senha" }).click()
    await expect(page.getByText("Informe a senha atual")).toBeVisible()
    await expect(page.getByText("A nova senha precisa ter pelo menos 12 caracteres")).toBeVisible()
  })
})
