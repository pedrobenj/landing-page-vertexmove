import { randomInt } from "node:crypto"

// Sem 0/O, 1/I/L para leitura fácil no WhatsApp e na retirada de kit.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"

/** Gera um código curto e legível, ex: VTX-7K3P. Somente servidor. */
export function generateRegistrationCode(length = 4): string {
  let code = ""
  for (let i = 0; i < length; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)]
  }
  return `VTX-${code}`
}
