import { formatDate } from "./format-date"

/** Valor de `<input type="datetime-local">`: `YYYY-MM-DDTHH:mm`. */
const LOCAL_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/

/**
 * `"2026-12-01T08:00"` (hora de Fortaleza, do `datetime-local`) → `"2026-12-01T08:00:00-03:00"`, o formato
 * de instante da API. Fortaleza não tem horário de verão: o offset é sempre -03:00.
 * Lança erro se o valor não for um `datetime-local` válido.
 */
export function toFortalezaIso(localValue: string): string {
  const match = LOCAL_INPUT_PATTERN.exec(localValue)
  if (!match) throw new Error(`Data e hora inválidas: ${localValue}`)
  const [, year, month, day, hour, minute] = match.map(Number)
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute))
  const isReal =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    hour < 24 &&
    minute < 60
  if (!isReal) throw new Error(`Data e hora inválidas: ${localValue}`)
  return `${localValue}:00-03:00`
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

/** Instante ISO da API (qualquer offset) → valor de `datetime-local` em Fortaleza (para preencher o form). */
export function toFortalezaLocalInput(iso: string): string {
  return formatDate(iso, "yyyy-MM-dd'T'HH:mm")
}
