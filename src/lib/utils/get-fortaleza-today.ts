const FORTALEZA_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Fortaleza",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

/** Data de hoje em Fortaleza no formato da API (`YYYY-MM-DD`). */
export function getFortalezaToday(now: Date): string {
  return FORTALEZA_DATE.format(now)
}
