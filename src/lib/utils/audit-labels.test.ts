import { describe, expect, it } from "vitest"

import { formatAuditEntity, getAuditActionLabel, getAuditEntityLabel } from "./audit-labels"

describe("audit labels", () => {
  it("ações conhecidas com rótulo próprio, no vocabulário de corrida", () => {
    expect(getAuditActionLabel("evento.publicado")).toBe("Corrida publicada")
    expect(getAuditActionLabel("evento.excluido")).toBe("Corrida excluída")
    expect(getAuditActionLabel("tamanho_camisa.criado")).toBe("Tamanho de camisa criado")
    expect(getAuditActionLabel("distancia.criada")).toBe("Distância criada")
  })

  it("ações desconhecidas no formato entidade.verbo", () => {
    expect(getAuditActionLabel("cupom.excluido")).toBe("Cupom excluído")
    expect(getAuditActionLabel("distancia.novo_verbo")).toBe("Distancia novo verbo")
  })

  it("outros formatos ficam como vieram", () => {
    expect(getAuditActionLabel("LOGIN")).toBe("LOGIN")
    expect(getAuditActionLabel("a.b.c")).toBe("a.b.c")
  })

  it("entidades", () => {
    expect(getAuditEntityLabel("evento")).toBe("Corrida")
    expect(getAuditEntityLabel("cupom_parceiro")).toBe("Cupom parceiro")
    expect(formatAuditEntity("evento", "12")).toBe("Corrida #12")
    expect(formatAuditEntity("sessao", null)).toBe("Sessão")
  })
})
