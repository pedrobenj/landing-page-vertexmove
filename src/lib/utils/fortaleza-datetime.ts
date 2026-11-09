import { formatDate } from "./format-date"

/**
 * Valor de `<input type="datetime-local">`: `YYYY-MM-DDTHH:mm`, com segundos opcionais (`:ss`) — alguns
 * navegadores os incluem quando o valor tem segundos ou `step` < 60. Os segundos são normalizados para `:00`.
 */
const LOCAL_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/

/**
 * `"2026-12-01T08:00"` (hora de Fortaleza, do `datetime-local`) → `"2026-12-01T08:00:00-03:00"`, o formato
 * de instante da API. Lança erro se o valor não for um `datetime-local` válido.
 *
 * Offset fixo -03:00: Fortaleza não tem horário de verão desde 2001 (regra IANA atual de
 * America/Fortaleza). Para datas anteriores (lotes e documentos são sempre recentes) o offset histórico
 * da IANA poderia ser -02:00; o inverso (`toFortalezaLocalInput`) usa a regra IANA completa via TZDate.
 */
export function toFortalezaIso(localValue: string): string {
  const match = LOCAL_INPUT_PATTERN.exec(localValue)
  if (!match) throw new Error(`Data e hora inválidas: ${localValue}`)
  const [, year, month, day, hour, minute, second = 0] = match.map((part) => Number(part ?? 0))
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute))
  const isReal =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    hour < 24 &&
    minute < 60 &&
    second < 60
  if (!isReal) throw new Error(`Data e hora inválidas: ${localValue}`)
  return `${localValue.slice(0, 16)}:00-03:00`
}

/** `true` se o valor é um `datetime-local` existente. */
export function isFortalezaLocalInput(localValue: string): boolean {
  try {
    toFortalezaIso(localValue)
    return true
  } catch {
    return false
  }
}

/**
 * Instante ISO da API (qualquer offset) → valor de `datetime-local` em Fortaleza (para preencher o form).
 * Instante inválido vira `""` (o campo fica vazio e a validação pede o valor), sem derrubar a página.
 */
export function toFortalezaLocalInput(iso: string): string {
  if (Number.isNaN(Date.parse(iso))) return ""
  return formatDate(iso, "yyyy-MM-dd'T'HH:mm")
}
