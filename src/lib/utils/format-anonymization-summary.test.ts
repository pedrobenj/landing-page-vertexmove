import { describe, expect, it } from "vitest"

import { formatAnonymizationSummary } from "./format-anonymization-summary"

const base = { protocolo: "LGPD-2026-ABCDEFGH", anonimizadaEm: "2026-11-23T13:00:00.000Z" }

describe("formatAnonymizationSummary", () => {
  it("resume as contagens com plural", () => {
    expect(formatAnonymizationSummary({ ...base, atletas: 1, inscricoes: 2, pedidos: 0, notificacoes: 1 })).toBe(
      "1 cadastro, 2 inscrições, 0 pedidos e 1 notificação anonimizados.",
    )
  })

  it("repetição (idempotente): avisa que não havia nada novo", () => {
    expect(formatAnonymizationSummary({ ...base, atletas: 0, inscricoes: 0, pedidos: 0, notificacoes: 0 })).toBe(
      "Nada novo para anonimizar: os dados já estavam anonimizados.",
    )
  })
})
