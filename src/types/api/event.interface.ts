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

/** Item de `GET /eventos` e `GET /eventos/encerrados` (sem `id`, `status` nem `descricao`). */
export interface PublicEvent {
  slug: string
  nome: string
  dataEvento: string // YYYY-MM-DD
  horarioLargada: string // HH:mm
  localizacao: EventLocation
  /** "Local — Bairro, Cidade/UF" */
  localizacaoResumo: string
  imagemCapaUrl: string | null
}
