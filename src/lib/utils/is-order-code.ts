/**
 * Formato do código de pedido da loja: `VTX-P-7K3PQ-M9X2D`. Alfabeto do backend
 * (`gerar-codigo-pedido.ts`): `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (sem 0/O/1/I).
 */
export const ORDER_CODE_PATTERN = /^VTX-P-[2-9A-HJ-NP-Z]{5}-[2-9A-HJ-NP-Z]{5}$/

export function isOrderCode(value: string): boolean {
  return ORDER_CODE_PATTERN.test(value)
}
