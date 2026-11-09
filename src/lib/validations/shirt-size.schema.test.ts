import { describe, expect, it } from "vitest"

import { shirtSizeFormSchema } from "./shirt-size.schema"

describe("shirtSizeFormSchema", () => {
  it("normaliza o código em maiúsculas", () => {
    expect(shirtSizeFormSchema.parse({ codigo: " xxgg ", descricao: "", ordem: "7", ativo: true })).toEqual({
      codigo: "XXGG",
      descricao: null,
      ordem: 7,
      ativo: true,
    })
  })

  it("recusa código inválido", () => {
    expect(shirtSizeFormSchema.safeParse({ codigo: "G G", descricao: "", ordem: "1", ativo: true }).success).toBe(false)
    expect(shirtSizeFormSchema.safeParse({ codigo: "", descricao: "", ordem: "1", ativo: true }).success).toBe(false)
  })
})
