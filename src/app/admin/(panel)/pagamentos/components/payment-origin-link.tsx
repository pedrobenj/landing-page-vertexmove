import Link from "next/link"

import { getPaymentOrigin } from "@/lib/utils/admin-payment-links"
import type { ApiAdminPayment } from "@/types/api/admin-payment.interface"

interface PaymentOriginLinkProps {
  payment: Pick<ApiAdminPayment, "origem">
}

/** Link para a inscrição ou o pedido da loja dono do pagamento. */
export function PaymentOriginLink({ payment }: PaymentOriginLinkProps) {
  const origin = getPaymentOrigin(payment)
  return (
    <Link href={origin.href} className="font-semibold text-brand-navy underline-offset-4 hover:underline">
      {origin.label}
    </Link>
  )
}
