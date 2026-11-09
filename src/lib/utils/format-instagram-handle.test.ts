import { describe, expect, it } from "vitest"

import { formatInstagramHandle } from "./format-instagram-handle"

describe("formatInstagramHandle", () => {
  it("extrai o perfil da URL", () => {
    expect(formatInstagramHandle("https://www.instagram.com/vertex.corrida/")).toBe("@vertex.corrida")
    expect(formatInstagramHandle("instagram.com/vertex?igsh=abc")).toBe("@vertex")
  })

  it("aceita perfil com ou sem @", () => {
    expect(formatInstagramHandle("@vertex")).toBe("@vertex")
    expect(formatInstagramHandle("vertex")).toBe("@vertex")
  })

  it("devolve vazio para entrada vazia ou URL sem perfil", () => {
    expect(formatInstagramHandle("")).toBe("")
    expect(formatInstagramHandle("https://instagram.com/")).toBe("")
  })
})
