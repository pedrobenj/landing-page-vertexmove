import type { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

/** Corpo de `POST /inscricoes`. Exige pelo menos um de `cpf`/`whatsapp`. */
export interface CreateRegistrationInput {
  eventoSlug: string
  distanciaId: number
  kitId?: number
  tamanhoCamisaId?: number
  nomeCompleto: string
  dataNascimento: string // YYYY-MM-DD
  cpf?: string // só dígitos
  whatsapp?: string // E.164
  email?: string
  documentosAceitos: number[]
}

/** Resposta 201 de `POST /inscricoes` (sem PII). */
export interface CreatedRegistration {
  codigo: string // VX-2026-00000042
  status: REGISTRATION_STATUS
  valorBaseCentavos: number
  valorDescontoCentavos: number
  valorTotalCentavos: number
  kitId?: number | null
  tamanhoCamisaId?: number | null
}

/** Corpo de `POST /inscricoes/consulta`: exatamente um dos campos. */
export type RegistrationLookupInput = { cpf: string } | { whatsapp: string }

export interface RegistrationLookupItem {
  /** Referência opaca (não é o código) para pedir o comprovante. Campo PROPOSTO ao backend (§16). */
  referencia: string
  nomeMascarado: string
  evento: string
  distancia: string
  status: REGISTRATION_STATUS
  inscritoEm: string // ISO-8601
}
