import { describe, expect, it } from "vitest"

import { truncateText } from "./truncate-text"

describe("truncateText", () => {
  it("mantém textos curtos (normalizando espaços)", () => {
    expect(truncateText("  Camisa   oficial  ", 155)).toBe("Camisa oficial")
  })

  it("corta na última palavra inteira e adiciona reticências", () => {
    expect(truncateText("Camisa oficial do grupo de corrida", 20)).toBe("Camisa oficial do…")
  })

  it("nunca passa do limite", () => {
    const text = "a".repeat(300)
    const result = truncateText(text, 155)
    expect(result.length).toBeLessThanOrEqual(155)
    expect(result.endsWith("…")).toBe(true)
  })
})
