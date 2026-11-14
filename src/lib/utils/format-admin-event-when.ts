import { formatApiDate } from "./format-api-date"

interface AdminEventWhen {
  dataEvento: string
  /** Só no detalhe: a listagem `GET /admin/eventos` do backend não traz o horário. */
  horarioLargada?: string | null
}

/** "12/12/2026 · 07:00", ou só a data quando o horário não veio. */
export function formatAdminEventWhen({ dataEvento, horarioLargada }: AdminEventWhen): string {
  const date = formatApiDate(dataEvento)
  return horarioLargada ? `${date} · ${horarioLargada}` : date
}
