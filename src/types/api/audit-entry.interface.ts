/** Item de `GET /admin/auditoria`. Formato a confirmar com o backend (não está no contrato). */
export interface AuditEntry {
  id: number
  acao: string
  entidade: string
  entidadeId: string | null
  adminNome: string | null
  criadoEm: string // ISO-8601
  detalhes?: Record<string, unknown>
}
