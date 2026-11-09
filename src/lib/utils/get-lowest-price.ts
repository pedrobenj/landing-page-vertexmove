import type { PublicDistance } from "@/types/api/public-event-detail.interface"

/**
 * Menor `precoCentavos` entre as distâncias não esgotadas que têm lote vigente — o "a partir de".
 * Só para exibição: nenhuma decisão de cobrança depende dele. `null` se não houver preço disponível.
 */
export function getLowestPrice(distances: readonly PublicDistance[] | null | undefined): number | null {
  let lowest: number | null = null
  for (const distance of distances ?? []) {
    if (distance.esgotado || !distance.loteVigente) continue
    const price = distance.loteVigente.precoCentavos
    if (lowest === null || price < lowest) lowest = price
  }
  return lowest
}
