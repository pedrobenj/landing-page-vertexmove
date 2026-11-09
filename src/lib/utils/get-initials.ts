const IGNORED_WORDS = new Set(["da", "das", "de", "do", "dos", "e", "na", "nas", "no", "nos"])

/** `"Academia Movimento" → "AM"`. Ignora preposições e devolve no máximo `max` letras. */
export function getInitials(name: string, max = 2): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word && !IGNORED_WORDS.has(word.toLowerCase()))
  return words
    .slice(0, max)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
}
