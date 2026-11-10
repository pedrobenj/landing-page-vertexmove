import { expect, type Page, test } from "@playwright/test"

import { NAVIGATION_TIMEOUT, registerAthlete } from "./helpers/registration-flow"
import { generateValidCpf, generateWhatsapp } from "./helpers/test-data"

/** Inscreve e vai até o checkout simulado do mock (no lugar do Mercado Pago). */
async function goToMockCheckout(page: Page): Promise<string> {
  await registerAthlete(page, { name: "Paula Souza", birthDate: "15/08/1992", cpf: generateValidCpf(), whatsapp: generateWhatsapp() })
  const code = (await page.getByTestId("registration-code").textContent())!.trim()
  await page.getByRole("button", { name: "Ir para o pagamento" }).click()
  await expect(page).toHaveURL(`/dev/checkout-pro/${code}`, { timeout: NAVIGATION_TIMEOUT })
  return code
}

test.describe("Pagamento (Checkout Pro, mock)", () => {
  test.slow()

  test("pagamento aprovado: confirma pelo polling e limpa os parâmetros da URL", async ({ page }) => {
    const code = await goToMockCheckout(page)
    await page.getByRole("button", { name: /Aprovar pagamento/ }).click()

    // O webhook simulado demora ~4 s: a página mostra "Confirmando…" e o polling traz a confirmação.
    // (O estado intermediário pode passar antes da primeira checagem se a rota demorar a compilar.)
    await expect(page.getByRole("heading", { name: "Pagamento confirmado!" })).toBeVisible({ timeout: 30_000 })
    await expect(page).toHaveURL(`/inscricao/${code}`)
    await expect(page.getByText("R$ 89,90")).toBeVisible()
  })

  test("pagamento recusado oferece nova tentativa", async ({ page }) => {
    const code = await goToMockCheckout(page)
    await page.getByRole("button", { name: /Recusar/ }).click()

    await expect(page.getByRole("heading", { name: "Pagamento não aprovado" })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await page.getByRole("button", { name: "Tentar novamente" }).click()
    await expect(page).toHaveURL(`/dev/checkout-pro/${code}`, { timeout: NAVIGATION_TIMEOUT })
  })

  test("Pix pendente mostra 'Aguardando pagamento' com 'Pagar agora', também ao recarregar", async ({ page }) => {
    const code = await goToMockCheckout(page)
    await page.getByRole("button", { name: /Deixar pendente/ }).click()
    await expect(page.getByRole("heading", { name: "Aguardando pagamento" })).toBeVisible({ timeout: NAVIGATION_TIMEOUT })
    await expect(page).toHaveURL(`/inscricao/${code}`)

    await page.reload()
    await expect(page.getByRole("heading", { name: "Aguardando pagamento" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Pagar agora" })).toBeVisible()
  })

  test("retorno sem código válido manda para a consulta", async ({ page }) => {
    await page.goto("/inscricao/retorno?external_reference=abc&status=approved")
    await expect(page.getByRole("heading", { level: 1, name: "Não identificamos a inscrição" })).toBeVisible()
  })
})
