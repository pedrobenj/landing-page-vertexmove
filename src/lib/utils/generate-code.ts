import { randomInt } from "node:crypto"

// Sem 0/O, 1/I/L para leitura fácil no WhatsApp e na retirada.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"

/** Somente servidor (usa node:crypto). */
function generateCode(prefix: string, length = 4): string {
  let code = ""
  for (let i = 0; i < length; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)]
  }
  return `${prefix}-${code}`
}

/** Pedido da loja, ex: VTX-P-7K3P */
export function generateOrderCode(): string {
  return generateCode("VTX-P")
}
