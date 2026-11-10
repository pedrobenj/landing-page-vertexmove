import { expect, test, type Page } from "@playwright/test"

// Produtos criados pelo e2e do admin (admin-store.spec.ts) entram no mesmo catálogo mock
// em memória do dev server; as contagens abaixo consideram só os produtos do seed.
const E2E_PRODUCT = /Camisa E2E/

async function addToCart(page: Page, slug: string, size?: string) {
  await page.goto(`/loja/${slug}`)
  // O radio do Radix fica sr-only; o clique vai no <Label htmlFor> visível.
  if (size) await page.getByText(size, { exact: true }).click()
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click()
  await expect(page.getByText("Adicionado ao carrinho")).toBeVisible()
}

test.describe("Loja", () => {
  test("catálogo lista as camisas e esconde produtos inativos", async ({ page }) => {
    await page.goto("/loja")
    const shirts = page.getByRole("region", { name: "Camisas", exact: true })
    await expect(shirts.getByRole("listitem").filter({ hasNotText: E2E_PRODUCT })).toHaveCount(3)
    for (const name of ["Camisa Oficial Vertex 2026", "Camisa Treino Dry-Fit", "Regata Vertex Run"]) {
      await expect(shirts.getByRole("listitem").filter({ hasText: name })).toHaveCount(1)
    }
    await expect(page.getByText(/medalha/i)).toHaveCount(0)
    await expect(page.getByText("Camisa Edição Limitada 2024")).toHaveCount(0)
    await expect(shirts.getByRole("listitem").filter({ hasText: "Regata Vertex Run" })).toContainText("Esgotado")
    await expect(shirts.getByRole("listitem").filter({ hasText: "Camisa Treino Dry-Fit" })).not.toContainText("Esgotado")
  })

  test("tamanho esgotado fica desabilitado", async ({ page }) => {
    await page.goto("/loja/camisa-oficial-vertex-2026")
    await expect(page.getByRole("radio", { name: /G \(esgotado\)/ })).toBeDisabled()
    await expect(page.getByRole("radio", { name: "M", exact: true })).toBeEnabled()
  })

  test("produto totalmente esgotado não pode ser comprado", async ({ page }) => {
    await page.goto("/loja/regata-vertex-run")
    await expect(page.getByRole("button", { name: "Esgotado" })).toBeDisabled()
    await expect(page.getByRole("button", { name: "Adicionar ao carrinho" })).toHaveCount(0)
  })

  test("adiciona ao carrinho, mostra o contador e mantém após recarregar", async ({ page }) => {
    await addToCart(page, "camisa-treino-dry-fit", "M")
    await expect(page.getByTestId("cart-count")).toHaveText("1")
    await page.reload()
    await expect(page.getByTestId("cart-count")).toHaveText("1")
    await page.goto("/loja/carrinho")
    await expect(page.getByText("Camisa Treino Dry-Fit")).toBeVisible()
    await expect(page.getByTestId("cart-total")).toHaveText(/R\$\s69,90/)
  })

  test("carrinho vazio mostra estado vazio", async ({ page }) => {
    await page.goto("/loja/carrinho")
    await expect(page.getByText("Seu carrinho está vazio.")).toBeVisible()
  })

  test("checkout valida os dados em português", async ({ page }) => {
    await addToCart(page, "camisa-treino-dry-fit", "M")
    await page.goto("/loja/checkout")
    await page.getByRole("button", { name: "Ir para o pagamento" }).click()
    await expect(page.getByText("Informe o nome completo")).toBeVisible()
    await expect(page.getByText("CPF inválido")).toBeVisible()
    await expect(page.getByText("Você precisa aceitar a política de privacidade")).toBeVisible()
    await expect(page).toHaveURL("/loja/checkout")
  })

  test("compra completa cria o pedido e limpa o carrinho", async ({ page }) => {
    // Action + revalidação + navegação bloqueante do /pedido podem passar de 30s no dev server sob carga.
    test.slow()
    await addToCart(page, "camisa-treino-dry-fit", "G")
    await page.goto("/loja/checkout")
    await page.getByLabel("Nome completo").fill("Maria da Silva")
    await page.getByLabel("CPF").fill("52998224725")
    await page.getByLabel("WhatsApp").fill("85988887777")
    await page.getByLabel("E-mail").fill("maria@exemplo.com")
    await page.getByLabel(/Li e aceito/).check()
    await page.getByRole("button", { name: "Ir para o pagamento" }).click()

    await expect(page).toHaveURL(/\/pedido\/VTX-P-[2-9A-HJKMNP-Z]{5}-[2-9A-HJKMNP-Z]{5}$/, { timeout: 20_000 })
    await expect(page.getByText("Pedido criado!")).toBeVisible()
    await expect(page.getByText("Aguardando pagamento")).toBeVisible()
    await expect(page.getByText("Olá, Maria!")).toBeVisible()
    await expect(page.getByTestId("order-total")).toHaveText(/R\$\s69,90/)
    await expect(page.getByRole("region", { name: "Itens" })).toContainText("Camisa Treino Dry-Fit (G)")
    await expect(page.getByText(/529\.?982\.?247-?25/)).toHaveCount(0)
    await expect(page.getByText("maria@exemplo.com")).toHaveCount(0)
    await expect(page.getByTestId("cart-count")).toHaveCount(0)
  })

  test("filtro por categoria: Todos + tipos", async ({ page }) => {
    await page.goto("/loja")
    const filters = page.getByRole("navigation", { name: "Categorias da loja" })
    await expect(filters.getByRole("link", { name: "Todos" })).toHaveAttribute("aria-current", "page")

    await filters.getByRole("link", { name: "Camisas" }).click()
    await expect(page).toHaveURL(/\/loja\?tipo=camisas$/)
    await expect(filters.getByRole("link", { name: "Camisas" })).toHaveAttribute("aria-current", "page")
    await expect(page.getByRole("region", { name: "Camisas", exact: true })).toBeVisible()

    await filters.getByRole("link", { name: "Todos" }).click()
    await expect(page).toHaveURL(/\/loja$/)
    await expect(filters.getByRole("link", { name: "Medalhas" })).toHaveCount(0)
    await expect(page.getByRole("region", { name: "Camisas", exact: true })).toBeVisible()
  })

  test("pedido inexistente retorna 404", async ({ page }) => {
    const response = await page.goto("/pedido/VTX-P-ZZZZZ-ZZZZZ")
    expect(response?.status()).toBe(404)
  })

  test("loja não tem rolagem horizontal", async ({ page }) => {
    for (const path of ["/loja", "/loja/camisa-oficial-vertex-2026", "/loja/carrinho"]) {
      await page.goto(path)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })
})
