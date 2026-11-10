import { simulateMockPaymentAction } from "@/app/actions/registration-payment"
import { Button } from "@/components/ui/button"
import type { PAYMENT_STATUS } from "@/enums/payment-status.enum"

interface MockPaymentOptionProps {
  code: string
  resultado: PAYMENT_STATUS
  label: string
  hint: string
}

export function MockPaymentOption({ code, resultado, label, hint }: MockPaymentOptionProps) {
  return (
    <form action={simulateMockPaymentAction.bind(null, code, resultado)}>
      <Button type="submit" variant="outline" size="xl" className="h-auto w-full flex-col items-start gap-0.5 py-3 normal-case tracking-normal">
        <span className="font-bold">{label}</span>
        <span className="text-xs font-normal text-muted-foreground">{hint}</span>
      </Button>
    </form>
  )
}
