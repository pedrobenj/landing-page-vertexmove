import { describe, expect, it } from "vitest"

import { pluralize } from "./pluralize"

describe("pluralize", () => {
  it("usa singular só para 1", () => {
    expect(pluralize(1, "corrida aberta", "corridas abertas")).toBe("1 corrida aberta")
    expect(pluralize(3, "corrida aberta", "corridas abertas")).toBe("3 corridas abertas")
    expect(pluralize(0, "corrida aberta", "corridas abertas")).toBe("0 corridas abertas")
  })
})
