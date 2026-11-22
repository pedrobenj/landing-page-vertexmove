/**
 * Item de `GET /corridas-parceiras` (`CorridaParceiraPublicaResponse` do backend, módulo `parceiras`).
 * Corrida de outra organização com cupom de desconto exclusivo do Vertex.
 */
export interface PartnerRace {
  id: number
  nome: string
  dataEvento: string // YYYY-MM-DD
  localNome: string
  cidade: string
  uf: string
  distancias: string[] // ex.: ["5 km", "10 km"]
  cupom: string
  descontoPercentual: number
  realizacao: string | null
  urlInscricao: string // https
  imagemCapaUrl: string | null // https
}

/** Item de `GET /admin/corridas-parceiras[/:id]` (`CorridaParceiraAdminResponse`). */
export interface AdminPartnerRace extends PartnerRace {
  ativo: boolean
  /** Menor aparece primeiro no site (0–32767). */
  ordem: number
  criadoEm: string // ISO
  atualizadoEm: string // ISO
}

/** Corpo de `POST /admin/corridas-parceiras` (objeto estrito); o `PATCH` aceita qualquer subconjunto. */
export interface PartnerRaceInput {
  nome: string
  dataEvento: string
  localNome: string
  cidade: string
  uf: string
  distancias: string[]
  cupom: string
  descontoPercentual: number
  realizacao: string | null
  urlInscricao: string
  imagemCapaUrl: string | null
  ativo: boolean
  ordem: number
}
