import type { LgpdAnonymizationResult } from "@/types/api/lgpd-request.interface"

import { pluralize } from "./pluralize"

/** Toast da anonimização: o que o backend apagou (0 em tudo = já estava anonimizado). */
export function formatAnonymizationSummary(result: LgpdAnonymizationResult): string {
  const { atletas, inscricoes, pedidos, notificacoes } = result
  if (atletas + inscricoes + pedidos + notificacoes === 0) return "Nada novo para anonimizar: os dados já estavam anonimizados."
  return `${pluralize(atletas, "cadastro", "cadastros")}, ${pluralize(inscricoes, "inscrição", "inscrições")}, ${pluralize(pedidos, "pedido", "pedidos")} e ${pluralize(notificacoes, "notificação", "notificações")} anonimizados.`
}
