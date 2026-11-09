import { describe, expect, it } from "vitest"

import { formatCountValue, parseCountValue } from "./count-value"

describe("parseCountValue", () => {
  it("separa prefixo, valor e sufixo", () => {
    expect(parseCountValue("3.500+")).toEqual({ prefix: "", value: 3500, suffix: "+", grouped: true })
    expect(parseCountValue("12+")).toEqual({ prefix: "", value: 12, suffix: "+", grouped: false })
    expect(parseCountValue("4")).toEqual({ prefix: "", value: 4, suffix: "", grouped: false })
    expect(parseCountValue("+1.200.000 km")).toEqual({ prefix: "+", value: 1200000, suffix: " km", grouped: true })
  })

  it("devolve null para formatos não numéricos ou ambíguos", () => {
    expect(parseCountValue("muitos")).toBeNull()
    expect(parseCountValue("4,5")).toBeNull()
    expect(parseCountValue("1.2")).toBeNull()
    expect(parseCountValue("")).toBeNull()
  })
})

describe("formatCountValue", () => {
  it("preserva prefixo, sufixo e separador de milhar", () => {
    const count = parseCountValue("3.500+")!
    expect(formatCountValue(count, 0)).toBe("0+")
    expect(formatCountValue(count, 1749.6)).toBe("1.750+")
    expect(formatCountValue(count, 3500)).toBe("3.500+")
  })

  it("não agrupa quando o original não agrupava", () => {
    expect(formatCountValue(parseCountValue("1500")!, 1500)).toBe("1500")
  })
})
