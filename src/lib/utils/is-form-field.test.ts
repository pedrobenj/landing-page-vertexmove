import { describe, expect, it } from "vitest"

import { isFormField } from "./is-form-field"

describe("isFormField", () => {
  it("só aceita chaves próprias do formulário (inclusive caminhos aninhados)", () => {
    const defaults = { nome: "", slug: "", fotos: [] }
    expect(isFormField(defaults, "slug")).toBe(true)
    expect(isFormField(defaults, "fotos.0.url")).toBe(true)
    expect(isFormField(defaults, "cep")).toBe(false)
    expect(isFormField(defaults, "toString")).toBe(false)
    expect(isFormField(defaults, "")).toBe(false)
  })
})
