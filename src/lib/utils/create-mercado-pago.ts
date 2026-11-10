/**
 * Instancia o SDK do Mercado Pago com a Public Key. Devolve `null` se o script ainda não carregou
 * (ver `MercadoPagoScript`) ou se a chave não estiver configurada.
 */
export function createMercadoPago(publicKey: string): MercadoPagoInstance | null {
  if (typeof window === "undefined" || !window.MercadoPago || !publicKey) return null
  return new window.MercadoPago(publicKey, { locale: "pt-BR" })
}
