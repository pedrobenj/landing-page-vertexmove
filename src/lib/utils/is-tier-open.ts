export interface TierWindow {
  inicioEm: string
  fimEm: string | null
  /** Ausente no detalhe público (a API só manda lotes ativos). */
  ativo?: boolean
}

/**
 * Lote aberto agora: ativo e com a janela `[inicioEm, fimEm)` contendo `now` (`fimEm` nulo = sem fim).
 * Regra única para o "lote vigente" do site e para o checklist do admin.
 */
export function isTierOpen(tier: TierWindow, now: Date): boolean {
  if (tier.ativo === false) return false
  const t = now.getTime()
  return Date.parse(tier.inicioEm) <= t && (tier.fimEm === null || t < Date.parse(tier.fimEm))
}
