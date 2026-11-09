import { describe, expect, it } from "vitest"

import { formatDistance } from "./format-distance"

describe("formatDistance", () => {
  it("formata quilômetros inteiros", () => {
    expect(formatDistance(5000)).toBe("5 km")
    expect(formatDistance(10000)).toBe("10 km")
  })

  it("formata quilômetros com uma casa decimal e vírgula", () => {
    expect(formatDistance(21097)).toBe("21,1 km")
    expect(formatDistance(42195)).toBe("42,2 km")
  })

  it("formata menos de 1 km em metros", () => {
    expect(formatDistance(800)).toBe("800 m")
  })
})
