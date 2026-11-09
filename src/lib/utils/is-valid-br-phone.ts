import { onlyDigits } from "./only-digits"

/** Remove o código do país (55) quando a entrada tem 12 ou 13 dígitos. */
export function stripCountryCode(digits: string): string {
  return (digits.length === 12 || digits.length === 13) && digits.startsWith("55") ? digits.slice(2) : digits
}

/**
 * DDD de 11 a 99 + 8 dígitos (fixo) ou 9 dígitos começando com 9 (celular).
 * Aceita também a entrada com o prefixo 55 (ex.: `+55 85 98888-7777`).
 */
export function isValidBrPhone(value: string): boolean {
  const digits = stripCountryCode(onlyDigits(value))
  if (digits.length !== 10 && digits.length !== 11) return false
  if (Number(digits.slice(0, 2)) < 11) return false
  return digits.length === 10 || digits[2] === "9"
}
