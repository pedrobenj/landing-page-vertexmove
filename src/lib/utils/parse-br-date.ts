import { format, isValid, parse } from "date-fns"

const BR_DATE = "dd/MM/yyyy"

/** `"06/12/1990"` → `Date` local (meia-noite). `null` se o formato ou a data não existirem (ex.: 31/02). */
export function parseBrDate(value: string): Date | null {
  const date = parse(value, BR_DATE, new Date(2000, 0, 1))
  if (!isValid(date) || format(date, BR_DATE) !== value) return null
  return date
}
