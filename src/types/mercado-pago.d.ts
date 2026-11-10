/** Tipos mínimos do SDK MercadoPago.js V2 (carregado por script, sem pacote npm). Ampliar ao usar os Bricks. */
interface MercadoPagoOptions {
  locale?: "pt-BR"
}

interface MercadoPagoInstance {
  bricks: () => unknown
}

interface Window {
  MercadoPago?: new (publicKey: string, options?: MercadoPagoOptions) => MercadoPagoInstance
}
