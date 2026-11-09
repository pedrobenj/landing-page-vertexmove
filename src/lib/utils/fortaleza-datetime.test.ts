import { describe, expect, it } from "vitest"

import { isFortalezaLocalInput, toFortalezaIso, toFortalezaLocalInput } from "./fortaleza-datetime"

describe("toFortalezaIso", () => {
  it("acrescenta segundos e o offset -03:00", () => {
    expect(toFortalezaIso("2026-12-01T08:00")).toBe("2026-12-01T08:00:00-03:00")
    expect(toFortalezaIso("2027-01-31T23:59")).toBe("2027-01-31T23:59:00-03:00")
  })

  it("aceita segundos opcionais e normaliza para :00", () => {
    expect(toFortalezaIso("2026-12-01T08:00:45")).toBe("2026-12-01T08:00:00-03:00")
    expect(() => toFortalezaIso("2026-12-01T08:00:60")).toThrow()
  })

  it("recusa formatos e datas inexistentes", () => {
    for (const value of ["2026-12-01", "2026-12-01 08:00", "2026-02-30T08:00", "2026-12-01T24:00", ""]) {
      expect(() => toFortalezaIso(value)).toThrow()
      expect(isFortalezaLocalInput(value)).toBe(false)
    }
    expect(isFortalezaLocalInput("2026-12-01T08:00")).toBe(true)
  })
})

describe("toFortalezaLocalInput", () => {
  it("converte qualquer offset para a hora de Fortaleza", () => {
    expect(toFortalezaLocalInput("2026-12-01T08:00:00-03:00")).toBe("2026-12-01T08:00")
    expect(toFortalezaLocalInput("2026-12-01T11:00:00Z")).toBe("2026-12-01T08:00")
    expect(toFortalezaLocalInput("2026-12-01T01:30:00Z")).toBe("2026-11-30T22:30")
  })

  it("instante inválido vira vazio, sem lançar", () => {
    expect(toFortalezaLocalInput("não é data")).toBe("")
  })

  it("ida e volta preserva o valor", () => {
    expect(toFortalezaLocalInput(toFortalezaIso("2026-06-15T19:45"))).toBe("2026-06-15T19:45")
  })
})
