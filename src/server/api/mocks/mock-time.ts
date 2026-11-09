import "server-only"

const DAY_MS = 86_400_000
const FORTALEZA_OFFSET_MS = 3 * 3_600_000

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS)
}

/** Instante ISO-8601 com offset de Fortaleza (`2026-12-06T05:30:00-03:00`), como a API devolve. */
export function toFortalezaIso(date: Date): string {
  return `${new Date(date.getTime() - FORTALEZA_OFFSET_MS).toISOString().slice(0, 19)}-03:00`
}

/** Data de hoje em Fortaleza (`YYYY-MM-DD`). */
export function todayInFortaleza(now: Date = new Date()): string {
  return toFortalezaIso(now).slice(0, 10)
}

/** Idade completa na data de referência (`YYYY-MM-DD`). */
export function ageOn(birthDate: string, referenceDate: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number)
  const [ry, rm, rd] = referenceDate.split("-").map(Number)
  const hadBirthday = rm > bm || (rm === bm && rd >= bd)
  return ry - by - (hadBirthday ? 0 : 1)
}
