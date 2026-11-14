import { EVENT_STATUS } from "@/enums/event-status.enum"

import type { EventReadiness } from "./get-event-readiness"

/** Resumo do checklist do dashboard (ex.: "Falta: lote, termo"). */
export function getReadinessSummary(readiness: EventReadiness, status: EVENT_STATUS): string {
  if (!readiness.ready) return `Falta: ${readiness.missing.join(", ")}`
  return status === EVENT_STATUS.PUBLISHED ? "Pronta para inscrições" : "Tudo pronto: falta só publicar"
}
