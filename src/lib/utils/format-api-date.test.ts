import { describe, expect, it } from "vitest"

import { formatApiDate, formatApiDateLong, formatApiDateShort, toApiDate } from "./format-api-date"

describe("format-api-date", () => {
  it("formata data da API como dd/MM/yyyy sem deslocar o fuso", () => {
    expect(formatApiDate("2026-12-06")).toBe("06/12/2026")
    expect(formatApiDate("2027-01-01")).toBe("01/01/2027")
  })

  it("formata por extenso com dia da semana", () => {
    expect(formatApiDateLong("2026-12-06")).toBe("domingo, 6 de dezembro de 2026")
  })

  it("formata no rótulo curto em caixa alta", () => {
    expect(formatApiDateShort("2026-09-06")).toBe("06 DE SET. DE 2026")
    expect(formatApiDateShort("2026-05-10")).toBe("10 DE MAI. DE 2026")
    expect(formatApiDateShort("2025-12-07")).toBe("07 DE DEZ. DE 2025")
    expect(() => formatApiDateShort("2026-13-01")).toThrow(Error)
  })

  it("converte dd/MM/yyyy para YYYY-MM-DD", () => {
    expect(toApiDate("06/12/2026")).toBe("2026-12-06")
  })

  it("lança erro para data inválida", () => {
    expect(() => toApiDate("31/02/2026")).toThrow(Error)
    expect(() => toApiDate("2026-12-06")).toThrow(Error)
  })
})
