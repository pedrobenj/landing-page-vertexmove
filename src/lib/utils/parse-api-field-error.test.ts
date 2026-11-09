import { describe, expect, it } from "vitest"

import { parseApiFieldError } from "./parse-api-field-error"

describe("parseApiFieldError", () => {
  it("separa campo e mensagem", () => {
    expect(parseApiFieldError("slug: Slug inválido.")).toEqual({ field: "slug", message: "Slug inválido." })
    expect(parseApiFieldError("fotos.0.url: URL inválida")).toEqual({ field: "fotos.0.url", message: "URL inválida" })
  })

  it("mensagem sem campo → null", () => {
    expect(parseApiFieldError("Dados inválidos.")).toBeNull()
    expect(parseApiFieldError("Não é possível publicar: status rascunho")).toBeNull()
  })
})
