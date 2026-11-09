/** Formato do código de pedido da loja: `VTX-P-7K3PQ-M9X2D` (ver generate-code.ts). */
export const ORDER_CODE_PATTERN = /^VTX-P-[2-9A-HJKMNP-Z]{5}-[2-9A-HJKMNP-Z]{5}$/

export function isOrderCode(value: string): boolean {
  return ORDER_CODE_PATTERN.test(value)
}
