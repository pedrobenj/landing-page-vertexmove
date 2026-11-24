import { expect, test } from "@playwright/test"

/**
 * Antes da hidratação, um `<form>` sem `method` é enviado pelo navegador como GET: os campos (senha, CPF,
 * nascimento) iriam para a URL, o histórico e os logs. Todo formulário com dado sensível declara `method="post"`.
 */
const PAGES = [
  { path: "/admin/login", form: "form" },
  { path: "/consulta", form: "form" },
  { path: "/privacidade/solicitacao", form: "form" },
]

for (const { path, form } of PAGES) {
  test(`${path}: formulário com method="post" já no HTML do servidor`, async ({ request }) => {
    const html = await (await request.get(path)).text()
    const forms = html.match(/<form\b[^>]*>/g) ?? []
    expect(forms.length, `nenhum ${form} em ${path}`).toBeGreaterThan(0)
    for (const tag of forms) expect(tag).toMatch(/method="post"/i)
  })
}
