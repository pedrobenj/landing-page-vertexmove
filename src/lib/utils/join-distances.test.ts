import { describe, expect, it } from "vitest"

import { joinDistances } from "./join-distances"

describe("joinDistances", () => {
  it("junta as distâncias com barra", () => {
    expect(joinDistances(["5 km", "10 km", "21 km"])).toBe("5 km | 10 km | 21 km")
    expect(joinDistances([])).toBe("")
  })
})
