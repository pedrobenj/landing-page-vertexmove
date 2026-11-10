export interface KitPhoto {
  url: string
  alt: string
  ordem: number
}

export interface KitInput {
  nome: string
  descricao: string | null
  /** Valor do kit, somado ao do lote vigente na inscrição. Campo PROPOSTO ao backend (§16). */
  precoCentavos: number
  ativo: boolean
  fotos: KitPhoto[]
}

export interface Kit extends KitInput {
  id: number
  eventoId: number
}
