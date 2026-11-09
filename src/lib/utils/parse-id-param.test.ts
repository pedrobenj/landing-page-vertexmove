import { describe, expect, it } from "vitest"

import { parseIdParam } from "./parse-id-param"

describe("parseIdParam", () => {
  it("aceita inteiros positivos", () => {
    expect(parseIdParam("1")).toBe(1)
    expect(parseIdParam("42")).toBe(42)
  })

  it("recusa o resto", () => {
    for (const value of ["0", "-1", "01", "1.5", "abc", "1e3", "", " 1", "99999999999999999999"]) {
      expect(parseIdParam(value)).toBeNull()
    }
  })
})
