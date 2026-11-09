/**
 * Item de `GET /corridas-parceiras` — rota PROPOSTA, ainda pendente no backend (§16 do CLAUDE.md).
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
  realizacao?: string | null
  urlInscricao: string
  imagemCapaUrl: string | null
}
