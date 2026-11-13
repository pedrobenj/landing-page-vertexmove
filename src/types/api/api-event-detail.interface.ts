import type { DOCUMENT_TYPE } from "@/enums/document-type.enum"

import type { PublicEvent } from "./event.interface"
import type { KitPhoto } from "./kit.interface"

/** Lote como o backend devolve em `GET /eventos/:slug` (`LotePublico`). */
export interface ApiPublicTier {
  id: number
  nome: string
  precoCentavos: number
  inicioEm: string // ISO
  fimEm: string | null
  quantidadeTotal: number | null
  ordem: number
}

export interface ApiPublicDistance {
  id: number
  nome: string
  descricao?: string | null
  distanciaMetros: number
  horarioLargada?: string | null
  percursoUrl?: string | null
  capacidadeTotal?: number | null
  ordem?: number
  lotes?: ApiPublicTier[]
  /** Formato futuro/mock: quando vier, tem precedência sobre o cálculo local. */
  loteVigente?: { nome: string; precoCentavos: number } | null
  esgotado?: boolean
}

export interface ApiPublicKit {
  id: number
  nome: string
  descricao?: string | null
  precoCentavos?: number
  fotos: KitPhoto[]
}

export interface ApiPublicDocument {
  id: number
  tipo: DOCUMENT_TYPE
  versao: string
  titulo: string
  /** O backend aceita documento sem URL; o adaptador descarta esses (não dá para ler antes de aceitar). */
  url: string | null
  vigenteEm?: string
}

export interface ApiKitPickup {
  local: string | null
  endereco: string | null
  inicio: string | null // ISO
  fim: string | null // ISO
  instrucoes: string | null
}

/** Resposta bruta de `GET /eventos/:slug` (backend real ou mock). */
export interface ApiPublicEventDetail extends PublicEvent {
  galeriaUrl?: string | null
  retiradaKit?: ApiKitPickup | null
  distancias?: ApiPublicDistance[]
  kits?: ApiPublicKit[]
  tamanhosCamisa?: Array<{ id: number; codigo: string; descricao: string | null; ordem: number; ativo?: boolean }>
  documentos?: ApiPublicDocument[]
  documentosVigentes?: ApiPublicDocument[]
}
