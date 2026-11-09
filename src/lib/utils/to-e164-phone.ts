import { isValidBrPhone } from "./is-valid-br-phone"
import { onlyDigits } from "./only-digits"

/**
 * Telefone brasileiro em E.164 (`+55DDDNÚMERO`), formato aceito pela API.
 * Lança erro se o número não for um telefone brasileiro válido (ver `isValidBrPhone`).
 */
export function toE164Phone(value: string): string {
  const digits = onlyDigits(value)
  const national = (digits.length === 12 || digits.length === 13) && digits.startsWith("55") ? digits.slice(2) : digits
  if (!isValidBrPhone(national)) {
    throw new Error("Telefone deve ter DDD válido e 8 ou 9 dígitos (celular começando com 9).")
  }
  return `+55${national}`
}
