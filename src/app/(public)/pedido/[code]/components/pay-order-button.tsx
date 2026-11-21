"use client"

import { ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { startStoreCheckoutAction } from "@/app/actions/store-payment"
import { Button } from "@/components/ui/button"

interface PayOrderButtonProps {
  code: string
  label?: string
}

/**
 * Pede ao backend o link do Checkout Pro do pedido e redireciona para o Mercado Pago. A action só devolve
 * links do Mercado Pago (validados no servidor); o front nunca monta a URL.
 */
export function PayOrderButton({ code, label = "Pagar agora" }: PayOrderButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  async function handleClick() {
    setIsRedirecting(true)
    const response = await startStoreCheckoutAction(code)
    if (!response.data) {
      toast.error(response.title, { description: response.error })
      setIsRedirecting(false)
      return
    }
    // Continua "carregando" até a página do Mercado Pago abrir.
    window.location.assign(response.data.checkoutUrl)
  }

  return (
    <Button type="button" variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto" disabled={isRedirecting} onClick={handleClick}>
      {isRedirecting ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
      {isRedirecting ? "Abrindo o Mercado Pago…" : label}
      {!isRedirecting && <ArrowRight aria-hidden="true" />}
    </Button>
  )
}
