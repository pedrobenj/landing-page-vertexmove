import { describe, expect, it } from "vitest"

import { getFirstName } from "./get-first-name"

describe("getFirstName", () => {
  it("retorna o primeiro nome", () => {
    expect(getFirstName("Maria da Silva")).toBe("Maria")
  })

  it("ignora espaços extras", () => {
    expect(getFirstName("   João   Pedro  ")).toBe("João")
  })

  it("retorna vazio para nome vazio", () => {
    expect(getFirstName("")).toBe("")
    expect(getFirstName("   ")).toBe("")
  })
})
