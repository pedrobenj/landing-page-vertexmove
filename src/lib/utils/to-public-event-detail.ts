import type {
  ApiPublicDistance,
  ApiPublicDocument,
  ApiPublicEventDetail,
  ApiPublicTier,
} from "@/types/api/api-event-detail.interface"
import type { DistanceAvailability, EventAvailability } from "@/types/api/event-availability.interface"
import type { PublicDistance, PublicDocument, PublicEventDetail } from "@/types/api/public-event-detail.interface"

import { isTierOpen } from "./is-tier-open"

/**
 * Lote vigente = ativo cuja janela contém `now`, menor `ordem`. Fallback para quando a disponibilidade
 * (`applyAvailability`) falha: não conhece vagas nem lote cheio. Quem cobra é o backend, que reprecifica
 * no `POST /inscricoes`.
 */
function currentTier(tiers: readonly ApiPublicTier[], now: Date): PublicDistance["loteVigente"] {
  const open = tiers.filter((tier) => isTierOpen(tier, now)).sort((a, b) => a.ordem - b.ordem)
  const tier = open[0]
  return tier ? { nome: tier.nome, precoCentavos: tier.precoCentavos } : null
}

function toDistance(distance: ApiPublicDistance, now: Date): PublicDistance {
  return {
    id: distance.id,
    nome: distance.nome,
    descricao: distance.descricao ?? null,
    distanciaMetros: distance.distanciaMetros,
    horarioLargada: distance.horarioLargada ?? null,
    percursoUrl: distance.percursoUrl ?? null,
    loteVigente: distance.loteVigente !== undefined ? distance.loteVigente : currentTier(distance.lotes ?? [], now),
    esgotado: distance.esgotado ?? false,
  }
}

/** Documento sem URL não pode ser lido antes do aceite: fica de fora (e a inscrição, indisponível). */
function toDocuments(documents: readonly ApiPublicDocument[]): PublicDocument[] {
  return documents.flatMap(({ id, tipo, versao, titulo, url }) => (url ? [{ id, tipo, versao, titulo, url }] : []))
}

/** Resposta de `GET /eventos/:slug` (backend real ou mock) → tipo usado pelas telas. */
export function toPublicEventDetail(raw: ApiPublicEventDetail, now: Date): PublicEventDetail {
  const { distancias, kits, tamanhosCamisa, documentos, documentosVigentes, ...event } = raw
  const rawDocuments = documentosVigentes ?? documentos
  return {
    ...event,
    distancias: distancias?.map((distance) => toDistance(distance, now)),
    kits: kits?.map((kit) => ({ ...kit, descricao: kit.descricao ?? null, precoCentavos: kit.precoCentavos ?? 0 })),
    tamanhosCamisa: tamanhosCamisa?.map((size) => ({ ...size, ativo: size.ativo ?? true })),
    documentosVigentes: rawDocuments ? toDocuments(rawDocuments) : undefined,
  }
}

function withAvailability(distance: PublicDistance, availability: DistanceAvailability | undefined): PublicDistance {
  if (!availability) return distance
  const tier = availability.loteVigente
  return {
    ...distance,
    loteVigente: tier ? { nome: tier.nome, precoCentavos: tier.precoCentavos } : null,
    esgotado: availability.esgotado,
  }
}

/**
 * Combina o detalhe (cacheado) com `GET /eventos/:slug/disponibilidade` (sem cache): o servidor decide
 * lote vigente e esgotado. Sem disponibilidade (`null`, a chamada falhou) fica o cálculo local; distância
 * ausente na resposta também mantém o valor local.
 */
export function applyAvailability(detail: PublicEventDetail, availability: EventAvailability | null): PublicEventDetail {
  if (!availability || !detail.distancias) return detail
  const byId = new Map(availability.distancias.map((item) => [item.distanciaId, item]))
  return { ...detail, distancias: detail.distancias.map((distance) => withAvailability(distance, byId.get(distance.id))) }
}
