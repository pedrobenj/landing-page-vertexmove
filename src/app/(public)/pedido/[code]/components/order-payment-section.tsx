"use client"

import { CircleCheckBig, Clock, Loader2, TicketX, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { PaymentStateCard } from "@/components/registration-payment/payment-state-card"
import { Button } from "@/components/ui/button"
import type { ORDER_STATUS } from "@/enums/order-status.enum"
import { useStoreOrderStatus } from "@/hooks/data/use-store-order-status"
import { formatDateTimeSafe } from "@/lib/utils/format-date"
import { getOrderPaymentView } from "@/lib/utils/get-order-payment-view"

import { PayOrderButton } from "./pay-order-button"

interface OrderPaymentSectionProps {
  code: string
  status: ORDER_STATUS
  expiresAt: Date | null
  /** Voltou do Checkout Pro: mostra "Confirmando seu pagamento…" e consulta até o webhook confirmar. */
  awaitingConfirmation: boolean
  /** O Mercado Pago voltou com o pagamento recusado: oferece nova tentativa em vez de esperar. */
  checkoutFailed: boolean
}

/** Pagamento do pedido: "Pagar agora" (Checkout Pro), a confirmação na volta do Mercado Pago e o resultado. */
export function OrderPaymentSection({ code, status: initialStatus, expiresAt, awaitingConfirmation, checkoutFailed }: OrderPaymentSectionProps) {
  const router = useRouter()
  const { status, pollingExpired } = useStoreOrderStatus(code, initialStatus, awaitingConfirmation && !checkoutFailed)

  // Tira do histórico os parâmetros do Mercado Pago, sem navegar (§7, item 5).
  useEffect(() => {
    if (awaitingConfirmation) window.history.replaceState(null, "", `/pedido/${code}`)
  }, [awaitingConfirmation, code])

  // O webhook confirmou: recarrega os dados do servidor (selo de status, itens).
  useEffect(() => {
    if (status !== initialStatus) router.refresh()
  }, [status, initialStatus, router])

  const view = getOrderPaymentView({ status, awaitingConfirmation, pollingExpired, checkoutFailed })
  const reservation = expiresAt ? `Os itens ficam reservados até ${formatDateTimeSafe(expiresAt)}.` : ""

  switch (view) {
    case "awaiting-payment":
      return (
        <PaymentStateCard icon={Clock} tone="waiting" title="Pague para garantir seus itens" description={`Pix ou cartão, pelo Mercado Pago. ${reservation}`.trim()}>
          <PayOrderButton code={code} />
        </PaymentStateCard>
      )
    case "confirming":
      return (
        <PaymentStateCard
          live
          icon={Loader2}
          iconClassName="animate-spin"
          tone="waiting"
          title="Confirmando seu pagamento…"
          description="Estamos aguardando a confirmação do Mercado Pago. Isso costuma levar poucos segundos."
        />
      )
    case "not-confirmed-yet":
      return (
        <PaymentStateCard
          live
          icon={Clock}
          tone="waiting"
          title="Ainda não recebemos a confirmação"
          description={`Se você já pagou, a confirmação pode levar alguns minutos: atualize esta página em instantes. Se não concluiu o pagamento, tente de novo. ${reservation}`.trim()}
        >
          <PayOrderButton code={code} label="Tentar novamente" />
        </PaymentStateCard>
      )
    case "payment-failed":
      return (
        <PaymentStateCard
          live
          icon={XCircle}
          tone="warning"
          title="Pagamento não aprovado"
          description={`O Mercado Pago não aprovou o pagamento. Tente de novo com outro meio. ${reservation}`.trim()}
        >
          <PayOrderButton code={code} label="Tentar novamente" />
        </PaymentStateCard>
      )
    case "paid":
      return (
        <PaymentStateCard
          live
          icon={CircleCheckBig}
          tone="success"
          title="Pagamento confirmado!"
          description="Seu pedido está garantido. Avisaremos quando estiver pronto para retirada."
        />
      )
    case "expired":
      return (
        <PaymentStateCard
          icon={TicketX}
          tone="warning"
          title="O prazo para pagar acabou"
          description="Os itens voltaram para o estoque. Se ainda quiser, faça um novo pedido na loja."
        >
          <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
            <Link href="/loja">Voltar à loja</Link>
          </Button>
        </PaymentStateCard>
      )
    default:
      return null
  }
}
