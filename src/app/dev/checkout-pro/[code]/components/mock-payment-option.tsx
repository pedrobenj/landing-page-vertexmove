import { simulateMockPaymentAction } from "@/app/actions/registration-payment"
import { simulateMockStorePaymentAction } from "@/app/actions/store-payment"
import { Button } from "@/components/ui/button"
import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"

interface MockPaymentOptionProps {
  code: string
  /** Inscrição volta para `/inscricao/retorno`; pedido da loja, para `/pedido/<codigo>`. */
  kind: "registration" | "order"
  resultado: PAYMENT_STATUS
  label: string
  hint: string
}

export function MockPaymentOption({ code, kind, resultado, label, hint }: MockPaymentOptionProps) {
  const action = kind === "order" ? simulateMockStorePaymentAction : simulateMockPaymentAction
  return (
    <form action={action.bind(null, code, resultado)}>
      <Button type="submit" variant="outline" size="xl" className="h-auto w-full flex-col items-start gap-0.5 py-3 normal-case tracking-normal">
        <span className="font-bold">{label}</span>
        <span className="text-xs font-normal text-muted-foreground">{hint}</span>
      </Button>
    </form>
  )
}
