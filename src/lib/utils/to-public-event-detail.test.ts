import { describe, expect, it } from "vitest"

import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import type { ApiPublicEventDetail } from "@/types/api/api-event-detail.interface"

import { toPublicEventDetail } from "./to-public-event-detail"

const NOW = new Date("2026-11-12T12:00:00-03:00")

function event(overrides: Partial<ApiPublicEventDetail> = {}): ApiPublicEventDetail {
  return {
    slug: "corrida",
    nome: "Corrida",
    descricao: "",
    dataEvento: "2026-12-10",
    horarioLargada: "05:30",
    localizacao: { localNome: "Praça", cidade: "Fortaleza", uf: "CE" },
    imagemCapaUrl: null,
    ...overrides,
  }
}

const tier = (id: number, inicioEm: string, fimEm: string | null, ordem: number, precoCentavos = 8000) => ({
  id,
  nome: `Lote ${id}`,
  precoCentavos,
  inicioEm,
  fimEm,
  quantidadeTotal: null,
  ordem,
})

describe("toPublicEventDetail", () => {
  it("escolhe o lote cuja janela contém agora, pela menor ordem", () => {
    const result = toPublicEventDetail(
      event({
        distancias: [
          {
            id: 1,
            nome: "5 km",
            distanciaMetros: 5000,
            lotes: [
              tier(1, "2026-10-01T00:00:00Z", "2026-11-01T00:00:00Z", 1, 6000), // já acabou
              tier(2, "2026-11-01T00:00:00Z", null, 2, 8000), // vigente
              tier(3, "2026-11-01T00:00:00Z", null, 3, 9000), // vigente, ordem maior
            ],
          },
        ],
      }),
      NOW,
    )
    expect(result.distancias?.[0]?.loteVigente).toEqual({ nome: "Lote 2", precoCentavos: 8000 })
    expect(result.distancias?.[0]?.esgotado).toBe(false)
  })

  it("sem lote na janela, loteVigente é null", () => {
    const result = toPublicEventDetail(
      event({ distancias: [{ id: 1, nome: "5 km", distanciaMetros: 5000, lotes: [tier(1, "2026-12-01T00:00:00Z", null, 1)] }] }),
      NOW,
    )
    expect(result.distancias?.[0]?.loteVigente).toBeNull()
  })

  it("respeita loteVigente/esgotado quando a API já manda (mock/futuro)", () => {
    const result = toPublicEventDetail(
      event({ distancias: [{ id: 1, nome: "5 km", distanciaMetros: 5000, loteVigente: null, esgotado: true }] }),
      NOW,
    )
    expect(result.distancias?.[0]).toMatchObject({ loteVigente: null, esgotado: true })
  })

  it("aceita documentos (backend) ou documentosVigentes (mock)", () => {
    const doc = { id: 9, tipo: DOCUMENT_TYPE.REGULATION, versao: "1", titulo: "Regulamento", url: "https://x/r.pdf" }
    expect(toPublicEventDetail(event({ documentos: [{ ...doc, vigenteEm: "2026-11-01T00:00:00Z" }] }), NOW).documentosVigentes).toEqual([doc])
    expect(toPublicEventDetail(event({ documentosVigentes: [doc] }), NOW).documentosVigentes).toEqual([doc])
  })

  it("descarta documento sem URL (o atleta não conseguiria ler antes de aceitar)", () => {
    const doc = { id: 9, tipo: DOCUMENT_TYPE.REGULATION, versao: "1", titulo: "Regulamento", url: null }
    expect(toPublicEventDetail(event({ documentos: [doc] }), NOW).documentosVigentes).toEqual([])
  })

  it("kit sem preço vale 0 e tamanho sem ativo vira ativo", () => {
    const result = toPublicEventDetail(
      event({
        kits: [{ id: 1, nome: "Kit", fotos: [] }],
        tamanhosCamisa: [{ id: 2, codigo: "M", descricao: null, ordem: 1 }],
      }),
      NOW,
    )
    expect(result.kits?.[0]?.precoCentavos).toBe(0)
    expect(result.tamanhosCamisa?.[0]?.ativo).toBe(true)
  })
})
