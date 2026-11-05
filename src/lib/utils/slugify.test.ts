import { describe, expect, it } from "vitest"

import { slugify } from "./slugify"

describe("slugify", () => {
  it("remove acentos, espaços e símbolos", () => {
    expect(slugify("Camisa Oficial Vertex 2026")).toBe("camisa-oficial-vertex-2026")
    expect(slugify("  Medalha — Beira-Mar (Edição Ímpar)! ")).toBe("medalha-beira-mar-edicao-impar")
  })
})
