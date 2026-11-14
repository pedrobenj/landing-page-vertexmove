import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import type { EventDocument } from "@/types/api/document.interface"
import type { PriceTier } from "@/types/api/price-tier.interface"

import { isTierOpen } from "./is-tier-open"

export type ReadinessItem = "lote" | "regulamento" | "termo"

export interface ReadinessDistance {
  ativo: boolean
  lotes: readonly Pick<PriceTier, "inicioEm" | "fimEm" | "ativo">[]
}

export interface EventReadinessInput {
  distances: readonly ReadinessDistance[]
  documents: readonly Pick<EventDocument, "tipo" | "vigenteEm">[]
}

export interface EventReadiness {
  ready: boolean
  missing: ReadinessItem[]
}

/**
 * O que falta para a corrida receber inscrições: uma distância ativa com lote aberto agora e o
 * regulamento e o termo já vigentes. Mesmas exigências do formulário público
 * (`getRegistrationAvailability`); vagas/esgotado não entram (o admin ainda não tem esse dado).
 */
export function getEventReadiness({ distances, documents }: EventReadinessInput, now: Date): EventReadiness {
  const isInForce = (tipo: DOCUMENT_TYPE) =>
    documents.some((document) => document.tipo === tipo && Date.parse(document.vigenteEm) <= now.getTime())
  const hasOpenTier = distances.some(
    (distance) => distance.ativo && distance.lotes.some((tier) => isTierOpen({ ...tier, fimEm: tier.fimEm ?? null }, now)),
  )

  const missing: ReadinessItem[] = []
  if (!hasOpenTier) missing.push("lote")
  if (!isInForce(DOCUMENT_TYPE.REGULATION)) missing.push("regulamento")
  if (!isInForce(DOCUMENT_TYPE.LIABILITY_TERM)) missing.push("termo")
  return { ready: missing.length === 0, missing }
}
