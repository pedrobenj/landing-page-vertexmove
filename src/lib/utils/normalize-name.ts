/** Nome como enviado à API: sem espaços nas pontas nem repetidos. */
export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ")
}
