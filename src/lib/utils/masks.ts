import { onlyDigits } from "./only-digits"

/** Máscara de input: 000.000.000-00 */
export function formatCpfInput(value: string): string {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

/** Máscara de input: (85) 98888-7777 */
export function formatPhoneInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2")
  }
  return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2")
}

/** Máscara de input: DD/MM/AAAA */
export function formatDateInput(value: string): string {
  return onlyDigits(value)
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
}

/** Para telas públicas (LGPD): ***.456.789-** */
export function maskCpf(value: string): string {
  const cpf = onlyDigits(value).padStart(11, "*")
  return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`
}

/** Para telas públicas (LGPD): (85) *****-7777 */
export function maskPhone(value: string): string {
  const digits = onlyDigits(value)
  return `(${digits.slice(0, 2)}) *****-${digits.slice(-4)}`
}

/** Para telas públicas (LGPD): p***o@gmail.com */
export function maskEmail(value: string): string {
  const [user = "", domain = ""] = value.split("@")
  if (user.length <= 2) return `${user[0] ?? ""}***@${domain}`
  return `${user[0]}***${user[user.length - 1]}@${domain}`
}
