import type { PublicDistance } from "@/types/api/public-event-detail.interface"

/**
 * Todas as distâncias esgotadas. Sem lote vigente não conta como esgotado: as inscrições só
 * não abriram ainda ("em breve").
 */
export function isSoldOut(distances: readonly PublicDistance[] | undefined): boolean {
  return (distances ?? []).length > 0 && distances!.every((distance) => distance.esgotado)
}
