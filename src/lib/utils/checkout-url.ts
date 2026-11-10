/** Checkout falso do modo mock (`USE_MOCK_API`), no lugar do Mercado Pago. */
export const MOCK_CHECKOUT_PATH = "/dev/checkout-pro/"

const MERCADO_PAGO_DOMAINS = ["mercadopago.com.br", "mercadopago.com"]

function isMercadoPagoHost(hostname: string): boolean {
  return MERCADO_PAGO_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
}

/**
 * O link devolvido pelo backend só é seguido se for HTTPS num domínio do Mercado Pago (§7 do CLAUDE.md).
 * No modo mock, aceita também o checkout falso local (caminho relativo, nunca `//host`).
 */
export function isAllowedCheckoutUrl(url: string, { allowMockCheckout = false } = {}): boolean {
  if (allowMockCheckout && url.startsWith(MOCK_CHECKOUT_PATH) && !url.includes("//")) return true
  try {
    const parsed = new URL(url)
    return parsed.protocol === "https:" && !parsed.username && !parsed.password && isMercadoPagoHost(parsed.hostname)
  } catch {
    return false
  }
}
