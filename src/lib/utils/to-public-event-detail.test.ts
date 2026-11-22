import { describe, expect, it } from "vitest"

import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import type { ApiPublicEventDetail } from "@/types/api/api-event-detail.interface"
import type { EventAvailability } from "@/types/api/event-availability.interface"
import type { PublicDistance, PublicEventDetail } from "@/types/api/public-event-detail.interface"

import { applyAvailability, toPublicEventDetail } from "./to-public-event-detail"

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

describe("applyAvailability", () => {
  const distance = (id: number, overrides: Partial<PublicDistance> = {}): PublicDistance => ({
    id,
    nome: `${id} km`,
    distanciaMetros: id * 1000,
    loteVigente: { nome: "Lote local", precoCentavos: 5000 },
    esgotado: false,
    ...overrides,
  })
  const detail = (distancias?: PublicDistance[]): PublicEventDetail => ({ ...toPublicEventDetail(event(), NOW), distancias })
  const availability = (distancias: EventAvailability["distancias"]): EventAvailability => ({
    eventoSlug: "corrida",
    calculadoEm: "2026-11-12T12:00:00-03:00",
    distancias,
  })

  it("sobrescreve loteVigente e esgotado por distanciaId", () => {
    const result = applyAvailability(
      detail([distance(5), distance(10)]),
      availability([
        { distanciaId: 10, esgotado: true, loteVigente: null },
        { distanciaId: 5, esgotado: false, loteVigente: { id: 4, nome: "2º lote", precoCentavos: 8900 } },
      ]),
    )
    expect(result.distancias?.[0]).toMatchObject({ loteVigente: { nome: "2º lote", precoCentavos: 8900 }, esgotado: false })
    expect(result.distancias?.[1]).toMatchObject({ loteVigente: null, esgotado: true })
  })

  it("distância ausente na disponibilidade mantém o cálculo local", () => {
    const result = applyAvailability(detail([distance(5)]), availability([]))
    expect(result.distancias?.[0]).toEqual(distance(5))
  })

  it("loteVigente null vindo do servidor vence o lote local (inscrições em breve)", () => {
    const result = applyAvailability(detail([distance(5)]), availability([{ distanciaId: 5, esgotado: false, loteVigente: null }]))
    expect(result.distancias?.[0]?.loteVigente).toBeNull()
  })

  it("sem disponibilidade (falhou) devolve o detalhe como está", () => {
    const original = detail([distance(5)])
    expect(applyAvailability(original, null)).toBe(original)
  })

  it("sem distâncias no detalhe não inventa nenhuma", () => {
    const result = applyAvailability(detail(undefined), availability([{ distanciaId: 5, esgotado: true, loteVigente: null }]))
    expect(result.distancias).toBeUndefined()
  })
})
