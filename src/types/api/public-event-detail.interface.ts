import type { DOCUMENT_TYPE } from "@/enums/document-type.enum"

import type { PublicEvent } from "./event.interface"
import type { KitPhoto } from "./kit.interface"
import type { ShirtSize } from "./shirt-size.interface"

export interface PublicDistance {
  id: number
  nome: string
  descricao?: string | null
  distanciaMetros: number
  horarioLargada?: string | null // HH:mm
  percursoUrl?: string | null
  loteVigente: { nome: string; precoCentavos: number } | null
  esgotado: boolean
}

export interface PublicKit {
  id: number
  nome: string
  descricao?: string | null
  fotos: KitPhoto[]
}

export interface PublicDocument {
  id: number
  tipo: DOCUMENT_TYPE
  versao: string
  titulo: string
  url: string
}

/**
 * Resposta de `GET /eventos/:slug`.
 *
 * `distancias`, `kits`, `tamanhosCamisa` e `documentosVigentes` são campos PROPOSTOS ao backend
 * (§16 do CLAUDE.md) e ainda não fazem parte do contrato — por isso opcionais.
 */
export interface PublicEventDetail extends PublicEvent {
  galeriaUrl?: string | null
  distancias?: PublicDistance[]
  kits?: PublicKit[]
  tamanhosCamisa?: ShirtSize[]
  documentosVigentes?: PublicDocument[]
}
