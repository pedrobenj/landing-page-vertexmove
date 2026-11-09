export interface KitPhoto {
  url: string
  alt: string
  ordem: number
}

export interface KitInput {
  nome: string
  descricao: string | null
  ativo: boolean
  fotos: KitPhoto[]
}

export interface Kit extends KitInput {
  id: number
  eventoId: number
}
