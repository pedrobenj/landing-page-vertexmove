import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import type { EventDocument } from "@/types/api/document.interface"

const DOCUMENT_TYPE_LABELS: Record<DOCUMENT_TYPE, string> = {
  [DOCUMENT_TYPE.REGULATION]: "Regulamento",
  [DOCUMENT_TYPE.LIABILITY_TERM]: "Termo de responsabilidade",
}

export const DOCUMENT_TYPE_OPTIONS = Object.values(DOCUMENT_TYPE).map((tipo) => ({ value: tipo, label: DOCUMENT_TYPE_LABELS[tipo] }))

export function getDocumentTypeLabel(tipo: DOCUMENT_TYPE | string): string {
  return (DOCUMENT_TYPE_LABELS as Partial<Record<string, string>>)[tipo] ?? tipo
}

export interface DocumentTypeGroup {
  tipo: DOCUMENT_TYPE
  label: string
  /** Versões da mais nova (vigência mais recente) para a mais antiga. */
  documents: EventDocument[]
  /** Versão em vigor agora: a de vigência mais recente que já começou. `null` se nenhuma começou. */
  currentId: number | null
}

/** Documentos da corrida agrupados por tipo (sempre os dois tipos, mesmo vazios). */
export function groupDocumentsByType(documents: readonly EventDocument[], now: Date = new Date()): DocumentTypeGroup[] {
  return Object.values(DOCUMENT_TYPE).map((tipo) => {
    const ofType = documents
      .filter((document) => document.tipo === tipo)
      .sort((a, b) => Date.parse(b.vigenteEm) - Date.parse(a.vigenteEm) || b.id - a.id)
    const current = ofType.find((document) => Date.parse(document.vigenteEm) <= now.getTime())
    return { tipo, label: DOCUMENT_TYPE_LABELS[tipo], documents: ofType, currentId: current?.id ?? null }
  })
}
