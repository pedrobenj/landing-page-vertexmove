import { parseBrDate } from "./parse-br-date"

const API_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Idade completa (em anos) de quem nasceu em `birthDate` (`DD/MM/AAAA`) na data `onDate` (`YYYY-MM-DD`,
 * data pura da API, ex.: `dataEvento`). Compara só ano/mês/dia — sem conversão de fuso. `null` se
 * alguma das datas for inválida. Nascido em 29/02 completa anos em 01/03 nos anos não bissextos.
 */
export function calcAgeOnDate(birthDate: string, onDate: string): number | null {
  const birth = parseBrDate(birthDate)
  const match = API_DATE.exec(onDate)
  if (!birth || !match) return null

  const [year, month, day] = match.slice(1).map(Number)
  // Valida a data da API sem fuso (ex.: 2026-02-30 não existe).
  const check = new Date(Date.UTC(year, month - 1, day))
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null

  const birthMonth = birth.getMonth() + 1
  const birthDay = birth.getDate()
  const hadBirthday = month > birthMonth || (month === birthMonth && day >= birthDay)
  return year - birth.getFullYear() - (hadBirthday ? 0 : 1)
}
