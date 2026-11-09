import { describe, expect, it } from "vitest"

import { normalizeName } from "./normalize-name"

describe("normalizeName", () => {
  it("remove espaços nas pontas e repetidos", () => {
    expect(normalizeName("  Maria   da  Silva ")).toBe("Maria da Silva")
  })
})
