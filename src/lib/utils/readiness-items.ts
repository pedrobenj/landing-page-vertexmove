import type { ReadinessItem } from "./get-event-readiness"

export interface ReadinessItemConfig {
  item: ReadinessItem
  label: string
  /** Subpágina da corrida onde se resolve (`/admin/eventos/:id/<section>`). */
  section: "distancias" | "documentos"
}

/** Itens do checklist, na ordem exibida. */
export const READINESS_ITEMS: readonly ReadinessItemConfig[] = [
  { item: "lote", label: "Distância com lote de preço vigente", section: "distancias" },
  { item: "regulamento", label: "Regulamento vigente", section: "documentos" },
  { item: "termo", label: "Termo de responsabilidade vigente", section: "documentos" },
]
