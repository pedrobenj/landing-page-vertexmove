import { describe, expect, it } from "vitest"

import { calcAgeOnDate } from "./calc-age-on-date"

describe("calcAgeOnDate", () => {
  it("calcula a idade completa na data informada", () => {
    expect(calcAgeOnDate("06/12/1990", "2026-12-06")).toBe(36)
    expect(calcAgeOnDate("07/12/1990", "2026-12-06")).toBe(35)
    expect(calcAgeOnDate("06/12/2008", "2026-12-06")).toBe(18)
    expect(calcAgeOnDate("07/12/2008", "2026-12-06")).toBe(17)
    expect(calcAgeOnDate("31/01/2009", "2026-02-01")).toBe(17)
  })

  it("trata nascido em 29/02 como aniversário só a partir de 01/03 em ano não bissexto", () => {
    expect(calcAgeOnDate("29/02/2008", "2026-02-28")).toBe(17)
    expect(calcAgeOnDate("29/02/2008", "2026-03-01")).toBe(18)
  })

  it("devolve null para datas inválidas ou incompletas", () => {
    expect(calcAgeOnDate("31/02/2008", "2026-12-06")).toBeNull()
    expect(calcAgeOnDate("06/12/20", "2026-12-06")).toBeNull()
    expect(calcAgeOnDate("06/12/2008", "2026-13-01")).toBeNull()
    expect(calcAgeOnDate("06/12/2008", "")).toBeNull()
  })

  it("não depende do fuso do processo", () => {
    const original = process.env.TZ
    try {
      process.env.TZ = "Pacific/Kiritimati"
      expect(calcAgeOnDate("06/12/2008", "2026-12-06")).toBe(18)
      process.env.TZ = "Pacific/Pago_Pago"
      expect(calcAgeOnDate("06/12/2008", "2026-12-06")).toBe(18)
    } finally {
      process.env.TZ = original
    }
  })
})
