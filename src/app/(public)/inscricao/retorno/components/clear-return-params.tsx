"use client"

import { useEffect } from "react"

interface ClearReturnParamsProps {
  code: string
}

/**
 * Tira do histórico os parâmetros do Mercado Pago (`payment_id`, `status`…), trocando a URL por
 * `/inscricao/<código>` sem navegar: a tela de "Confirmando seu pagamento…" continua montada (§7, item 5).
 */
export function ClearReturnParams({ code }: ClearReturnParamsProps) {
  useEffect(() => {
    window.history.replaceState(null, "", `/inscricao/${code}`)
  }, [code])

  return null
}
