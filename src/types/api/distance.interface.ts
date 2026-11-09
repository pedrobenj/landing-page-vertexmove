export interface DistanceInput {
  nome: string
  descricao: string | null
  distanciaMetros: number
  capacidadeTotal: number
  horarioLargada: string | null // HH:mm
  percursoUrl: string | null
  ordem: number
  ativo: boolean
}

export interface Distance extends DistanceInput {
  id: number
  eventoId: number
}
