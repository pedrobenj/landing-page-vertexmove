import type {
  ApiPublicDistance,
  ApiPublicDocument,
  ApiPublicEventDetail,
  ApiPublicTier,
} from "@/types/api/api-event-detail.interface"
import type { PublicDistance, PublicDocument, PublicEventDetail } from "@/types/api/public-event-detail.interface"

/**
 * Lote vigente = ativo cuja janela contém `now`, menor `ordem`. Só para exibição: quem cobra é o backend,
 * que reprecifica no `POST /inscricoes`. Não conhece vagas — `esgotado` só vem da API (fase 3 do plano).
 */
function currentTier(tiers: readonly ApiPublicTier[], now: Date): PublicDistance["loteVigente"] {
  const t = now.getTime()
  const open = tiers
    .filter((tier) => Date.parse(tier.inicioEm) <= t && (tier.fimEm === null || t < Date.parse(tier.fimEm)))
    .sort((a, b) => a.ordem - b.ordem)
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
  return documents.flatMap(({ vigenteEm: _vigenteEm, url, ...document }) => (url ? [{ ...document, url }] : []))
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
