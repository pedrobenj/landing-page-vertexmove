import { onlyDigits } from "./only-digits"

export function whatsappLink(phone: string, message?: string): string {
  const base = `https://wa.me/${onlyDigits(phone)}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
