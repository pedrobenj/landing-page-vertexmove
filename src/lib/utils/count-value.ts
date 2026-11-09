import type { CountValue } from "@/types/count-value.interface"

const COUNT_PATTERN = /^(\D*?)(\d{1,3}(?:\.\d{3})+|\d+)(\D*)$/

/**
 * Interpreta um indicador como "3.500+", "+12" ou "4" para a contagem animada.
 * Só inteiros (ponto como separador de milhar, padrão pt-BR); qualquer outro formato → `null` (exibe estático).
 */
export function parseCountValue(text: string): CountValue | null {
  const match = COUNT_PATTERN.exec(text.trim())
  if (!match) return null
  const [, prefix, digits, suffix] = match
  return { prefix, value: Number(digits.replaceAll(".", "")), suffix, grouped: digits.includes(".") }
}

/** Remonta o texto do indicador para um valor intermediário da contagem (ex.: 1750 → "1.750+"). */
export function formatCountValue(count: CountValue, current: number): string {
  const rounded = String(Math.round(current))
  const digits = count.grouped ? rounded.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : rounded
  return `${count.prefix}${digits}${count.suffix}`
}
