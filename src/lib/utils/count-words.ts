/** Quantidade de palavras separadas por espaço (ignora espaços repetidos e nas pontas). */
export function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length
}
