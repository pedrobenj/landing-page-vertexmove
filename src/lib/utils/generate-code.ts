import { randomInt } from "node:crypto"

// Sem 0/O, 1/I/L para leitura fácil no WhatsApp e na retirada.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"
const BLOCK_LENGTH = 5

function generateBlock(): string {
  let block = ""
  for (let i = 0; i < BLOCK_LENGTH; i++) {
    block += ALPHABET[randomInt(ALPHABET.length)]
  }
  return block
}

/**
 * Pedido da loja, ex: VTX-P-7K3PQ-M9X2D. Somente servidor (usa node:crypto).
 * 10 caracteres de 31 símbolos (~49 bits): /pedido/[code] é público e mostra
 * primeiro nome, itens e valor, então o código não pode ser enumerável.
 */
export function generateOrderCode(): string {
  return `VTX-P-${generateBlock()}-${generateBlock()}`
}
