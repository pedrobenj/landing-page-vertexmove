import { describe, expect, it } from "vitest"

import { getInitials } from "./get-initials"

describe("getInitials", () => {
  it("pega a primeira letra das duas primeiras palavras", () => {
    expect(getInitials("Academia Movimento")).toBe("AM")
    expect(getInitials("Pé na Estrada Esportes")).toBe("PE")
  })

  it("ignora preposições", () => {
    expect(getInitials("Café da Orla")).toBe("CO")
  })

  it("lida com uma palavra e com espaços extras", () => {
    expect(getInitials("  vertex ")).toBe("V")
    expect(getInitials("")).toBe("")
  })
})
