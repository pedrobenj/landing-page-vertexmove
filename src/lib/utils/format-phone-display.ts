import { formatPhoneInput } from "./masks"
import { onlyDigits } from "./only-digits"

/** Telefone para exibição: "5585999999999" ou "+55 85 99999-9999" → "(85) 99999-9999". */
export function formatPhoneDisplay(value: string): string {
  const digits = onlyDigits(value)
  const national = digits.length > 11 && digits.startsWith("55") ? digits.slice(2) : digits
  return formatPhoneInput(national)
}
