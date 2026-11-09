import { describe, expect, it } from "vitest"

import { formatAuditEntity, getAuditActionLabel, getAuditEntityLabel } from "./audit-labels"

describe("audit labels", () => {
  it("ações no formato entidade.verbo", () => {
    expect(getAuditActionLabel("evento.publicado")).toBe("Evento publicado")
    expect(getAuditActionLabel("evento.excluido")).toBe("Evento excluído")
    expect(getAuditActionLabel("tamanho_camisa.criado")).toBe("Tamanho camisa criado")
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
