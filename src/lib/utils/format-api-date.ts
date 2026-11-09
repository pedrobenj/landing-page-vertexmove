import { format, isValid, parse } from "date-fns"
import { ptBR } from "date-fns/locale"

const API_DATE = "yyyy-MM-dd"
const BR_DATE = "dd/MM/yyyy"

/** Data pura da API (`YYYY-MM-DD`) como data local, sem conversão de fuso. */
function parseApiDate(value: string): Date {
  const date = parse(value, API_DATE, new Date(2000, 0, 1))
  if (!isValid(date)) throw new Error(`Data inválida: ${value}`)
  return date
}

/** `"2026-12-06" → "06/12/2026"` */
export function formatApiDate(value: string): string {
  return format(parseApiDate(value), BR_DATE)
}

/** `"2026-12-06" → "domingo, 6 de dezembro de 2026"` */
export function formatApiDateLong(value: string): string {
  return format(parseApiDate(value), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

/** `"06/12/2026" → "2026-12-06"`. Lança erro se a data não existir. */
export function toApiDate(value: string): string {
  const date = parse(value, BR_DATE, new Date(2000, 0, 1))
  if (!isValid(date) || format(date, BR_DATE) !== value) throw new Error(`Data inválida: ${value}`)
  return format(date, API_DATE)
}
