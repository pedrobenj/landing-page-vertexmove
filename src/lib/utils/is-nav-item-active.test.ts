import { describe, expect, it } from "vitest"

import { isNavItemActive } from "./is-nav-item-active"

describe("isNavItemActive", () => {
  it("ativa na própria rota e nas subrotas", () => {
    expect(isNavItemActive("/admin/eventos", "/admin/eventos")).toBe(true)
    expect(isNavItemActive("/admin/eventos/1/inscricoes", "/admin/eventos")).toBe(true)
  })

  it("não ativa em rotas com o mesmo prefixo de texto", () => {
    expect(isNavItemActive("/admin/eventos-antigos", "/admin/eventos")).toBe(false)
    expect(isNavItemActive("/admin", "/admin/eventos")).toBe(false)
  })
})
