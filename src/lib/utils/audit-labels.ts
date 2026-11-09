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

/**
 * Rótulos completos das ações conhecidas (as que o mock registra), no vocabulário do site: "corrida",
 * não "evento". Ações fora deste mapa caem no formato genérico de `getAuditActionLabel`.
 */
const ACTION_LABELS: Partial<Record<string, string>> = {
  "evento.criado": "Corrida criada",
  "evento.atualizado": "Corrida atualizada",
  "evento.excluido": "Corrida excluída",
  "evento.publicado": "Corrida publicada",
  "evento.despublicado": "Corrida despublicada",
  "evento.encerrado": "Corrida encerrada",
  "evento.cancelado": "Corrida cancelada",
  "evento.restaurado": "Corrida restaurada",
  "distancia.criada": "Distância criada",
  "distancia.atualizada": "Distância atualizada",
  "lote.criado": "Lote criado",
  "lote.atualizado": "Lote atualizado",
  "kit.criado": "Kit criado",
  "kit.atualizado": "Kit atualizado",
  "tamanho_camisa.criado": "Tamanho de camisa criado",
  "tamanho_camisa.atualizado": "Tamanho de camisa atualizado",
  "documento.criado": "Documento criado",
}

const humanize = (value: string) => value.replace(/_/g, " ")
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export function getAuditEntityLabel(entidade: string): string {
  return ENTITY_LABELS[entidade] ?? capitalize(humanize(entidade))
}

/**
 * Ação da auditoria legível. Ações conhecidas têm rótulo próprio (`"evento.publicado"` → `"Corrida publicada"`);
 * as demais mantêm os termos e o gênero vindos da API (sem inventar concordância): `"cupom.criado"` → `"Cupom criado"`.
 * Formato `<entidade>.<verbo>` a confirmar com o backend (§16); outros formatos aparecem como vieram.
 */
export function getAuditActionLabel(acao: string): string {
  const known = ACTION_LABELS[acao]
  if (known) return known
  const [entity, verb, ...rest] = acao.split(".")
  if (!entity || !verb || rest.length > 0) return acao
  return capitalize(`${humanize(entity)} ${VERB_LABELS[verb] ?? humanize(verb)}`)
}

/** `"Corrida #12"`; sem id, só o tipo. */
export function formatAuditEntity(entidade: string, entidadeId: string | null): string {
  const label = getAuditEntityLabel(entidade)
  return entidadeId ? `${label} #${entidadeId}` : label
}
