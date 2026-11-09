export interface ShirtSizeInput {
  codigo: string // ex.: "GG"
  descricao: string | null
  ordem: number
  ativo: boolean
}

export interface ShirtSize extends ShirtSizeInput {
  id: number
}
