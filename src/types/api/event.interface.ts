export interface EventLocation {
  localNome: string
  endereco?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade: string
  uf: string
  cep?: string | null
  latitude?: number | null
  longitude?: number | null
}

/** Item de `GET /eventos` (sem `id` nem `status`). */
export interface PublicEvent {
  slug: string
  nome: string
  descricao: string
  dataEvento: string // YYYY-MM-DD
  horarioLargada: string // HH:mm
  localizacao: EventLocation
  imagemCapaUrl: string | null
}
