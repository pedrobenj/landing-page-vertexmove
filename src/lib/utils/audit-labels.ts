const ENTITY_LABELS: Partial<Record<string, string>> = {
  evento: "Corrida",
  distancia: "Distância",
  lote: "Lote",
  kit: "Kit",
  documento: "Documento",
  tamanho_camisa: "Tamanho de camisa",
  admin: "Admin",
  sessao: "Sessão",
}

const VERB_LABELS: Partial<Record<string, string>> = {
  criado: "criado",
  criada: "criada",
  atualizado: "atualizado",
  atualizada: "atualizada",
  excluido: "excluído",
  excluida: "excluída",
  publicado: "publicado",
  despublicado: "despublicado",
  encerrado: "encerrado",
  cancelado: "cancelado",
  restaurado: "restaurado",
}

const humanize = (value: string) => value.replace(/_/g, " ")
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export function getAuditEntityLabel(entidade: string): string {
  return ENTITY_LABELS[entidade] ?? capitalize(humanize(entidade))
}

/**
 * Ação da auditoria legível, mantendo os termos e o gênero vindos da API (sem inventar concordância):
 * `"evento.publicado"` → `"Evento publicado"`, `"evento.excluido"` → `"Evento excluído"`.
 * Formato `<entidade>.<verbo>` a confirmar com o backend (§16); outros formatos aparecem como vieram.
 */
export function getAuditActionLabel(acao: string): string {
  const [entity, verb, ...rest] = acao.split(".")
  if (!entity || !verb || rest.length > 0) return acao
  return capitalize(`${humanize(entity)} ${VERB_LABELS[verb] ?? humanize(verb)}`)
}

/** `"Corrida #12"`; sem id, só o tipo. */
export function formatAuditEntity(entidade: string, entidadeId: string | null): string {
  const label = getAuditEntityLabel(entidade)
  return entidadeId ? `${label} #${entidadeId}` : label
}
