import { expect, type Page, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/admin-login"

const ORDER_URL = /\/pedido\/VTX-P-[2-9A-HJ-NP-Z]{5}-[2-9A-HJ-NP-Z]{5}$/

/** Compra pela loja (mock) e devolve o código do pedido pendente. */
async function placeOrder(page: Page): Promise<string> {
  await page.goto("/loja/camisa-treino-dry-fit")
  await page.getByText("P", { exact: true }).click()
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click()
  await expect(page.getByText("Adicionado ao carrinho")).toBeVisible()
  await page.goto("/loja/checkout")
  await page.getByLabel("Nome completo").fill("Joana Pereira")
  await page.getByLabel("CPF").fill("52998224725")
  await page.getByLabel("WhatsApp").fill("85988887777")
  await page.getByLabel("E-mail").fill("joana@exemplo.com")
  await page.getByLabel(/Li e aceito/).check()
  await page.getByRole("button", { name: "Ir para o pagamento" }).click()
  await expect(page).toHaveURL(ORDER_URL, { timeout: 20_000 })
  return new URL(page.url()).pathname.split("/").pop()!
}

test.describe("Admin: pedidos da loja", () => {
  test.describe.configure({ timeout: 90_000 })

  test("lista por status, abre o pedido com o contato e cancela com confirmação", async ({ page }) => {
    const code = await placeOrder(page)
    await loginAsAdmin(page)

    await page.goto("/admin/loja/pedidos")
    await expect(page.getByRole("heading", { name: "Pedidos da loja" })).toBeVisible()

    await page.getByLabel("Status").click()
    await page.getByRole("option", { name: "Aguardando pagamento" }).click()
    await page.getByRole("link", { name: `Ver pedido ${code}` }).click()

    await expect(page).toHaveURL(`/admin/loja/pedidos/${code}`, { timeout: 20_000 })
    await expect(page.getByRole("heading", { name: code })).toBeVisible()
    // O Next 16 mantém a rota anterior (a lista) escondida no DOM: delimita pela seção do comprador.
    const buyer = page.getByRole("region", { name: "Comprador" })
    await expect(buyer.getByText("Joana Pereira")).toBeVisible()
    await expect(buyer.getByText("joana@exemplo.com")).toBeVisible()
    await expect(buyer.getByText("***.982.247-**")).toBeVisible()
    await expect(page.getByRole("button", { name: "Pronto para retirada" })).toHaveCount(0)

    await page.getByRole("button", { name: "Cancelar pedido" }).click()
    const dialog = page.getByRole("dialog", { name: "Cancelar este pedido?" })
    await expect(dialog).toContainText("voltam para o estoque")
    await dialog.getByRole("button", { name: "Cancelar pedido" }).click()

    await expect(page.getByText("Pedido cancelado")).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole("region", { name: code }).getByText("Cancelado", { exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Cancelar pedido" })).toHaveCount(0)
  })

  test("pedido inexistente retorna 404", async ({ page }) => {
    await loginAsAdmin(page)
    const response = await page.goto("/admin/loja/pedidos/VTX-P-ZZZZZ-ZZZZZ")
    expect(response?.status()).toBe(404)
  })
})
