import { startOfToday } from "date-fns"

import { calcAgeOnDate } from "./calc-age-on-date"
import { parseBrDate } from "./parse-br-date"

/** Abaixo disso, a inscrição precisa ser feita ou autorizada pelo responsável legal (LGPD, art. 14). */
export const ADULT_AGE_YEARS = 18

/**
 * true se a idade em `eventDate` (`YYYY-MM-DD`) de quem nasceu em `birthDate` (`DD/MM/AAAA`) for
 * menor que 18. Data inválida ou no futuro → false (o próprio campo de nascimento já acusa o erro).
 */
export function isMinorOnDate(birthDate: string, eventDate: string): boolean {
  const birth = parseBrDate(birthDate)
  if (!birth || birth >= startOfToday()) return false
  const age = calcAgeOnDate(birthDate, eventDate)
  return age !== null && age < ADULT_AGE_YEARS
}
