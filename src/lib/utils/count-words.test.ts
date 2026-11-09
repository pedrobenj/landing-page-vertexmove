import { describe, expect, it } from "vitest"

import { countWords } from "./count-words"

describe("countWords", () => {
  it("conta palavras ignorando espaços extras", () => {
    expect(countWords("  Maria   da Silva ")).toBe(3)
    expect(countWords("Maria")).toBe(1)
    expect(countWords("   ")).toBe(0)
  })
})
