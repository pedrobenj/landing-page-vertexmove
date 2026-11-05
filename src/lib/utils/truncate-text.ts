/**
 * Encurta o texto para no máximo `maxLength` caracteres (contando a reticência),
 * cortando na última palavra inteira quando possível. Usado em meta descriptions.
 */
export function truncateText(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (normalized.length <= maxLength) return normalized

  const slice = normalized.slice(0, maxLength - 1)
  const lastSpace = slice.lastIndexOf(" ")
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice
  return `${cut.replace(/[\s,.;:–—-]+$/, "")}…`
}
