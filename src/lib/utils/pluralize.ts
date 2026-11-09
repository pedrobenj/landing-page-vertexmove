/** `pluralize(1, "corrida aberta", "corridas abertas") → "1 corrida aberta"`. */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}
