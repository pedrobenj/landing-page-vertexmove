import { formatDate, formatDateTime } from "./format-date"

function isValidInstant(value: string | null): value is string {
  return value !== null && !Number.isNaN(Date.parse(value))
}

/**
 * Janela de retirada do kit (`retiradaKit.inicio`/`fim`, instantes ISO) em texto, no fuso de Fortaleza.
 * Mesmo dia → "5 de dezembro de 2026, das 09:00 às 18:00". Instante ausente ou inválido é ignorado;
 * sem nenhum dos dois, `null`.
 */
export function formatKitPickupWindow(start: string | null, end: string | null): string | null {
  const hasStart = isValidInstant(start)
  const hasEnd = isValidInstant(end)
  if (hasStart && hasEnd) {
    if (formatDate(start, "yyyy-MM-dd") === formatDate(end, "yyyy-MM-dd")) {
      return `${formatDate(start)}, das ${formatDate(start, "HH:mm")} às ${formatDate(end, "HH:mm")}`
    }
    return `De ${formatDateTime(start)} até ${formatDateTime(end)}`
  }
  if (hasStart) return `A partir de ${formatDateTime(start)}`
  if (hasEnd) return `Até ${formatDateTime(end)}`
  return null
}
