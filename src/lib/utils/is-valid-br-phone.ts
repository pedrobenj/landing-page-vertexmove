import { onlyDigits } from "./only-digits"

/** DDD de 11 a 99 + 8 dígitos (fixo) ou 9 dígitos começando com 9 (celular). */
export function isValidBrPhone(value: string): boolean {
  const digits = onlyDigits(value)
  if (digits.length !== 10 && digits.length !== 11) return false
  if (Number(digits.slice(0, 2)) < 11) return false
  return digits.length === 10 || digits[2] === "9"
}
