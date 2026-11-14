import { describe, expect, it } from "vitest"

import { isTierOpen } from "./is-tier-open"

const NOW = new Date("2026-11-14T12:00:00-03:00")

describe("isTierOpen", () => {
  it("aberto quando a janela contém agora", () => {
    expect(isTierOpen({ inicioEm: "2026-11-01T00:00:00-03:00", fimEm: "2026-12-01T00:00:00-03:00" }, NOW)).toBe(true)
    expect(isTierOpen({ inicioEm: "2026-11-01T00:00:00-03:00", fimEm: null }, NOW)).toBe(true)
  })

  it("fechado antes do início, no fim ou depois", () => {
    expect(isTierOpen({ inicioEm: "2026-11-20T00:00:00-03:00", fimEm: null }, NOW)).toBe(false)
    expect(isTierOpen({ inicioEm: "2026-11-01T00:00:00-03:00", fimEm: "2026-11-14T12:00:00-03:00" }, NOW)).toBe(false)
    expect(isTierOpen({ inicioEm: "2026-10-01T00:00:00-03:00", fimEm: "2026-11-01T00:00:00-03:00" }, NOW)).toBe(false)
  })

  it("lote inativo nunca está aberto", () => {
    expect(isTierOpen({ inicioEm: "2026-11-01T00:00:00-03:00", fimEm: null, ativo: false }, NOW)).toBe(false)
  })
})
