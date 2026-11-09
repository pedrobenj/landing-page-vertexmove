import { onlyDigits } from "./only-digits"

/** Telefone brasileiro em E.164 (`+55DDDNÚMERO`), formato aceito pela API. */
export function toE164Phone(value: string): string {
  const digits = onlyDigits(value)
  const national = (digits.length === 12 || digits.length === 13) && digits.startsWith("55") ? digits.slice(2) : digits
  if (national.length !== 10 && national.length !== 11) {
    throw new Error("Telefone deve ter DDD e 8 ou 9 dígitos.")
  }
  return `+55${national}`
}
