import { expect, type Page, test } from "@playwright/test"

import { MOCK_ONLY } from "./helpers/mock-only"
import { chooseOption, NAVIGATION_TIMEOUT, registerAthlete } from "./helpers/registration-flow"
import { generateValidCpf, generateWhatsapp } from "./helpers/test-data"
import { uniqueSuffix } from "./helpers/unique-suffix"

const SENT_MESSAGE = "Se houver inscrição com e-mail cadastrado, enviamos um link válido por 30 minutos."

async function requestLinkByCpf(page: Page, cpf: string) {
  await page.goto("/consulta")
  await chooseOption(page, /^CPF$/)
  await page.getByLabel("CPF usado na inscrição").fill(cpf)
  await page.getByRole("button", { name: "Consultar" }).click()
  await page.getByRole("button", { name: "Receber link de acesso por e-mail" }).click()
  await expect(page.getByText(SENT_MESSAGE)).toBeVisible()
}

/** Caixa de entrada simulada do mock (`/dev/emails`): href do link mais recente enviado para `email`. */
async function receivedLink(page: Page, email: string): Promise<string> {
  await page.goto("/dev/emails")
  const message = page.getByRole("article", { name: `E-mail para ${email}` }).first()
  const href = await message.getByRole("link", { name: "Acessar minha inscrição" }).getAttribute("href")
  expect(href).toMatch(/^\/inscricao\/acesso\?t=/)
  return href ?? ""
}

test.describe("Link de acesso à inscrição por e-mail", () => {
  // @mock: no backend real o token só existe no e-mail (EMAIL_PROVIDER=fake não o registra), sem como capturar.
  test("pede o link em outro aparelho, abre o link e cai na inscrição; o link não vale de novo", MOCK_ONLY, async ({ page, browser }) => {
    test.slow()
    const cpf = generateValidCpf()
    const email = `atleta.${uniqueSuffix()}@example.com`
    const code = await registerAthlete(page, { name: "Bia Rocha Lima", birthDate: "03/04/1995", cpf, whatsapp: generateWhatsapp(), email })

    // Outro "aparelho": contexto novo, sem o cookie da inscrição.
    const otherDevice = await browser.newContext()
    try {
      const other = await otherDevice.newPage()
      await requestLinkByCpf(other, cpf)
      const link = await receivedLink(other, email)

      await other.goto(link)
      await expect(other).toHaveURL(`/inscricao/${code}`, { timeout: NAVIGATION_TIMEOUT })
      await expect(other.getByRole("heading", { name: "Aguardando pagamento" })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
      await expect(other.getByRole("button", { name: "Pagar agora" })).toBeVisible()

      // Uso único: o mesmo link agora é inválido, e o token sai da URL.
      await other.goto(link)
      await expect(other.getByRole("heading", { name: "Link inválido ou expirado" })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
      await expect(other).toHaveURL("/inscricao/acesso")
      await expect(other.getByRole("link", { name: "Pedir um novo link" })).toHaveAttribute("href", "/consulta")
    } finally {
      await otherDevice.close()
    }

    // O link reemite o token: o aparelho original perde o acesso e é orientado a pedir um link.
    await page.goto(`/inscricao/${code}`)
    await expect(page.getByText("Abra no aparelho da inscrição")).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page.getByText(/link de acesso mais recente/)).toBeVisible()
  })

  test("sem inscrição a mensagem é a mesma (não revela cadastro)", async ({ page }) => {
    await requestLinkByCpf(page, generateValidCpf())
    await expect(page.getByText("Nenhuma inscrição encontrada para os dados informados.")).toBeVisible()
  })

  test("link sem token mostra a mensagem de inválido", async ({ page }) => {
    await page.goto("/inscricao/acesso")
    await expect(page.getByRole("heading", { name: "Link inválido ou expirado" })).toBeVisible()
  })

  test("token inexistente: a API responde 404 e a página mostra inválido, sem o token na URL", async ({ page }) => {
    await page.goto(`/inscricao/acesso?t=${"x".repeat(43)}`)
    await expect(page.getByRole("heading", { name: "Link inválido ou expirado" })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page).toHaveURL("/inscricao/acesso")
  })
})
