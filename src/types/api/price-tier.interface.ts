export interface PriceTierInput {
  nome: string
  precoCentavos: number
  inicioEm: string // ISO-8601 com offset
  fimEm: string // ISO-8601 com offset
  quantidadeTotal: number | null
  ordem: number
  ativo: boolean
}

export interface PriceTier extends PriceTierInput {
  id: number
  distanciaId: number
}
