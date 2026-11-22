/** Situação de uma distância em `GET /eventos/:slug/disponibilidade` (calculada pelo backend, sem cache). */
export interface DistanceAvailability {
  distanciaId: number
  esgotado: boolean
  /** `null` = nenhum lote aberto agora (inscrições "em breve"). */
  loteVigente: { id: number; nome: string; precoCentavos: number } | null
  /** Opcional no contrato (decisão D2); o front ainda não exibe. */
  vagasRestantes?: number
}

/** Resposta de `GET /eventos/:slug/disponibilidade`. */
export interface EventAvailability {
  eventoSlug: string
  calculadoEm: string // ISO-8601 (UTC, `toISOString` do backend)
  distancias: DistanceAvailability[]
}
