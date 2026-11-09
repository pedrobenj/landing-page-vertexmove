import { describe, expect, it } from "vitest"

import { normalizeCpf } from "./normalize-cpf"

describe("normalizeCpf", () => {
  it("remove a máscara", () => {
    expect(normalizeCpf("529.982.247-25")).toBe("52998224725")
  })

  it("corta em 11 dígitos", () => {
    expect(normalizeCpf("529982247251234")).toBe("52998224725")
  })

  it("devolve vazio para entrada sem dígitos", () => {
    expect(normalizeCpf("abc")).toBe("")
  })
})
