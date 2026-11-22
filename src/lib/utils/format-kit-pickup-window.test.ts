import { describe, expect, it } from "vitest"

import { formatKitPickupWindow } from "./format-kit-pickup-window"

describe("formatKitPickupWindow", () => {
  it("mesmo dia: data por extenso e intervalo de horas (fuso de Fortaleza)", () => {
    expect(formatKitPickupWindow("2026-12-05T12:00:00.000Z", "2026-12-05T21:00:00.000Z")).toBe(
      "5 de dezembro de 2026, das 09:00 às 18:00",
    )
  })

  it("dias diferentes: início e fim completos", () => {
    expect(formatKitPickupWindow("2026-12-04T12:00:00.000Z", "2026-12-05T21:00:00.000Z")).toBe(
      "De 04/12/2026 às 09:00 até 05/12/2026 às 18:00",
    )
  })

  it("só início ou só fim", () => {
    expect(formatKitPickupWindow("2026-12-04T12:00:00-03:00", null)).toBe("A partir de 04/12/2026 às 12:00")
    expect(formatKitPickupWindow(null, "2026-12-05T18:00:00-03:00")).toBe("Até 05/12/2026 às 18:00")
  })

  it("sem janela ou com instantes inválidos: null", () => {
    expect(formatKitPickupWindow(null, null)).toBeNull()
    expect(formatKitPickupWindow("lixo", "também lixo")).toBeNull()
    expect(formatKitPickupWindow("lixo", "2026-12-05T18:00:00-03:00")).toBe("Até 05/12/2026 às 18:00")
  })
})
