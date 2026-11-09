import type { DOCUMENT_TYPE } from "@/enums/document-type.enum"

/** Documentos são versionados e imutáveis (sem PATCH). */
export interface EventDocumentInput {
  eventoId: number
  tipo: DOCUMENT_TYPE
  versao: string
  titulo: string
  url: string
  hashSha256: string
  vigenteEm: string // ISO-8601 com offset
}

export interface EventDocument extends EventDocumentInput {
  id: number
}
