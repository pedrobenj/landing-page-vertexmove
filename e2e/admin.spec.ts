import { expect, type Page, test } from "@playwright/test"

const ADMIN_EMAIL = "admin@example.com"
const PASSWORD = "Vertex@Dev12345"

async function login(page: Page, email: string, password: string) {
  await page.goto("/admin/login")
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel("Senha").fill(password)
  await page.getByRole("button", { name: "Entrar" }).click()
}

test.describe("Área do admin", () => {
  // Login + action + compilação do /admin no dev server passam dos 30s padrão quando a suíte roda em paralelo.
  test.describe.configure({ timeout: 60_000 })

  test("login com a conta da organização mostra o nome no painel", async ({ page }) => {
    await login(page, ADMIN_EMAIL, PASSWORD)

    await expect(page).toHaveURL("/admin", { timeout: 20_000 })
    await expect(page.getByRole("heading", { level: 1, name: "Bom te ver, Organização Vertex" })).toBeVisible()
    await expect(page.getByTestId("admin-user-badge")).toContainText("Organização Vertex")
    await expect(page.getByRole("navigation", { name: "Menu do admin" }).getByRole("link", { name: "Eventos" })).toBeVisible()

    const cookies = await page.context().cookies()
    const access = cookies.find((cookie) => cookie.name === "vm_admin_at")
    expect(access?.httpOnly).toBe(true)
    expect(cookies.find((cookie) => cookie.name === "vm_admin_rt")?.httpOnly).toBe(true)
    expect(cookies.find((cookie) => cookie.name === "vm_admin_csrf")?.httpOnly).toBe(true)
  })

  test("senha errada mostra o aviso de credenciais inválidas", async ({ page }) => {
    // Outra conta: as falhas contam para o bloqueio (5 tentativas) e não podem travar o admin dos outros testes.
    await login(page, "operador@example.com", "senha-errada")

    await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible({ timeout: 15_000 })
    await expect(page).toHaveURL("/admin/login")
  })

  test("conta com MFA mostra a mensagem de verificação em duas etapas", async ({ page }) => {
    await login(page, "superadmin@example.com", PASSWORD)

    await expect(page.getByText("Esta conta exige verificação em duas etapas, ainda indisponível.")).toBeVisible({
      timeout: 15_000,
    })
    await expect(page).toHaveURL("/admin/login")
  })

  test("valida o formulário de login em português", async ({ page }) => {
    await page.goto("/admin/login")
    await page.getByLabel("E-mail").fill("email-invalido")
    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(page.getByText("E-mail inválido")).toBeVisible()
    await expect(page.getByText("Informe a senha")).toBeVisible()
  })

  test("/admin/eventos sem sessão vai para o login", async ({ page }) => {
    await page.goto("/admin/eventos")
    await expect(page).toHaveURL("/admin/login")
    await expect(page.getByRole("heading", { level: 1, name: "Entrar" })).toBeVisible()
  })

  test("sessão expirada é renovada pelo refresh token sem voltar ao login", async ({ page }) => {
    await login(page, ADMIN_EMAIL, PASSWORD)
    await expect(page).toHaveURL("/admin", { timeout: 20_000 })
    const oldRefresh = (await page.context().cookies()).find((cookie) => cookie.name === "vm_admin_rt")?.value

    await page.context().clearCookies({ name: "vm_admin_at" })
    await page.goto("/admin/eventos")

    await expect(page).toHaveURL("/admin/eventos")
    await expect(page.getByTestId("admin-user-badge")).toContainText("Organização Vertex")
    const cookies = await page.context().cookies()
    expect(cookies.find((cookie) => cookie.name === "vm_admin_at")?.value).toBeTruthy()
    expect(cookies.find((cookie) => cookie.name === "vm_admin_rt")?.value).not.toBe(oldRefresh)
  })

  test("token revogado limpa a sessão e para no login, sem loop", async ({ page, baseURL }) => {
    await page.context().addCookies([{ name: "vm_admin_at", value: "token-revogado", url: baseURL! }])

    await page.goto("/admin")

    await expect(page).toHaveURL("/admin/login?expirada=1", { timeout: 20_000 })
    await expect(page.getByText("Sua sessão expirou. Entre novamente para continuar.")).toBeVisible()
    expect((await page.context().cookies()).find((cookie) => cookie.name === "vm_admin_at")).toBeUndefined()
  })

  test("logout volta ao login e encerra a sessão", async ({ page }) => {
    await login(page, ADMIN_EMAIL, PASSWORD)
    await expect(page).toHaveURL("/admin", { timeout: 20_000 })

    await page.getByRole("button", { name: "Sair" }).click()

    await expect(page).toHaveURL("/admin/login", { timeout: 15_000 })
    const names = (await page.context().cookies()).map((cookie) => cookie.name)
    expect(names).not.toContain("vm_admin_at")
    expect(names).not.toContain("vm_admin_rt")

    await page.goto("/admin/eventos")
    await expect(page).toHaveURL("/admin/login")
  })

  test("prefetch sem sessão (proxy pulado pelo matcher) não vaza dados do admin", async ({ request }) => {
    for (const path of ["/admin/loja/produtos", "/admin/loja/produtos/novo"]) {
      const response = await request.get(path, { headers: { "next-router-prefetch": "1" }, maxRedirects: 0 })
      const body = await response.text()
      expect(body).not.toContain("Camisa Edição Limitada 2024")
      expect(body).not.toContain("Salvar produto")
    }
  })

  test("não é indexado por buscadores", async ({ page }) => {
    await page.goto("/admin/login")
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/)
  })
})
