"use client"

import Script from "next/script"

import { publicEnv } from "@/lib/public-env"
import { createMercadoPago } from "@/lib/utils/create-mercado-pago"

export const MERCADO_PAGO_SDK_URL = "https://sdk.mercadopago.com/js/v2"

interface MercadoPagoScriptProps {
  /** Chamado com o SDK já inicializado com a Public Key. */
  onReady: (mercadoPago: MercadoPagoInstance) => void
}

/**
 * Carrega o MercadoPago.js V2. Usar só na página de pagamento (`/inscricao/[code]`): é a única rota cuja
 * CSP libera os domínios do Mercado Pago (`PAYMENT_PATHS` no next.config.ts).
 * Sem `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`, não carrega nada.
 */
export function MercadoPagoScript({ onReady }: MercadoPagoScriptProps) {
  if (!publicEnv.mercadoPagoPublicKey) return null

  function handleReady() {
    const mercadoPago = createMercadoPago(publicEnv.mercadoPagoPublicKey)
    if (mercadoPago) onReady(mercadoPago)
  }

  return <Script src={MERCADO_PAGO_SDK_URL} strategy="afterInteractive" onReady={handleReady} />
}
