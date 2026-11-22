import { PaymentStatusBadge } from "@/components/admin"
import { getPaymentMethodLabel, getReasonLabel } from "@/lib/utils/admin-registration-labels"
import { formatCurrency } from "@/lib/utils/format-currency"
import { formatDateTimeSafe } from "@/lib/utils/format-date"
import type { ApiAdminRegistrationPaymentDetails } from "@/types/api/admin-registration.interface"

interface RegistrationPaymentItemProps {
  payment: ApiAdminRegistrationPaymentDetails
}

export function RegistrationPaymentItem({ payment }: RegistrationPaymentItemProps) {
  return (
    <li className="flex flex-col gap-1 py-2 text-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium">
          Pagamento #{payment.id} · <span className="tabular-nums">{formatCurrency(payment.valorCentavos)}</span>
          {payment.metodo && <span className="text-muted-foreground"> · {getPaymentMethodLabel(payment.metodo)}</span>}
        </span>
        <PaymentStatusBadge status={payment.status} />
      </div>
      <p className="text-xs text-muted-foreground">
        Criado em {formatDateTimeSafe(payment.criadoEm)}
        {payment.pagoEm && ` · pago em ${formatDateTimeSafe(payment.pagoEm)}`}
        {payment.estornoSolicitadoEm && ` · estorno solicitado em ${formatDateTimeSafe(payment.estornoSolicitadoEm)}`}
      </p>
      {payment.estornoMotivo && <p className="text-xs text-muted-foreground">Motivo do estorno: {getReasonLabel(payment.estornoMotivo)}</p>}
    </li>
  )
}
