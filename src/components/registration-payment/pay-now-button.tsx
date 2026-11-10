"use client"

import { ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { startRegistrationCheckoutAction } from "@/app/actions/registration-payment"
import { Button } from "@/components/ui/button"

interface PayNowButtonProps {
  code: string
  label?: string
}

/**
 * Pede ao backend o link do Checkout Pro e redireciona para o Mercado Pago. A action só devolve links
 * do Mercado Pago (validados no servidor); o front nunca monta a URL.
 */
export function PayNowButton({ code, label = "Pagar agora" }: PayNowButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  async function handleClick() {
    setIsRedirecting(true)
    const response = await startRegistrationCheckoutAction(code)
    if (!response.data) {
      toast.error(response.title, { description: response.error })
      setIsRedirecting(false)
      return
    }
    // Continua "carregando" até a página do Mercado Pago abrir.
    window.location.assign(response.data.checkoutUrl)
  }

  return (
    <Button
      type="button"
      variant="cta"
      size="xl"
      className="w-full normal-case tracking-normal sm:w-auto"
      disabled={isRedirecting}
      onClick={handleClick}
    >
      {isRedirecting ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
      {isRedirecting ? "Abrindo o Mercado Pago…" : label}
      {!isRedirecting && <ArrowRight aria-hidden="true" />}
    </Button>
  )
}
