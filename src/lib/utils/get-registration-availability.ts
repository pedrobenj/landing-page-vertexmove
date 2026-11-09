import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import type { PublicDocument, PublicEventDetail } from "@/types/api/public-event-detail.interface"

export type RegistrationAvailability =
  | { status: "open"; regulation: PublicDocument; liabilityTerm: PublicDocument }
  | { status: "soon" }
  | { status: "sold-out" }

/**
 * Se o formulário pode abrir: exige distâncias, ao menos uma com lote vigente e vaga, e o regulamento
 * e o termo de responsabilidade vigentes (campos PROPOSTOS ao backend, §16 — podem faltar).
 */
export function getRegistrationAvailability(event: PublicEventDetail): RegistrationAvailability {
  const distances = event.distancias ?? []
  const documents = event.documentosVigentes ?? []
  const regulation = documents.find((document) => document.tipo === DOCUMENT_TYPE.REGULATION)
  const liabilityTerm = documents.find((document) => document.tipo === DOCUMENT_TYPE.LIABILITY_TERM)

  if (distances.length === 0 || !regulation || !liabilityTerm) return { status: "soon" }
  if (distances.every((distance) => distance.esgotado)) return { status: "sold-out" }
  if (!distances.some((distance) => distance.loteVigente !== null)) return { status: "soon" }
  return { status: "open", regulation, liabilityTerm }
}
