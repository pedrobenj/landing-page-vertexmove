import { PaymentStatusBadge } from "@/components/admin"
import { TableCell, TableRow } from "@/components/ui/table"
import { getPaymentMethodLabel, getReasonLabel } from "@/lib/utils/admin-registration-labels"
import { formatCurrency } from "@/lib/utils/format-currency"
import { formatDateTimeSafe } from "@/lib/utils/format-date"
import type { ApiAdminPayment } from "@/types/api/admin-payment.interface"

import { PaymentOriginLink } from "./payment-origin-link"
import { ReconcilePaymentButton } from "./reconcile-payment-button"
import { RefundPaymentButton } from "./refund-payment-button"

interface PaymentsTableRowProps {
  payment: ApiAdminPayment
  canManage: boolean
  onChanged: () => void
}

/** As ações vêm do backend (`acoes`); a API confere de novo e responde 409 se o status mudou. */
export function PaymentsTableRow({ payment, canManage, onChanged }: PaymentsTableRowProps) {
  const mismatch = payment.valorGatewayCentavos !== null && payment.valorGatewayCentavos !== payment.valorCentavos
  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <p className="font-semibold tabular-nums">
          #{payment.id}
          {payment.metodo && <span className="font-normal text-muted-foreground"> · {getPaymentMethodLabel(payment.metodo)}</span>}
        </p>
        <PaymentOriginLink payment={payment} />
        <p className="text-xs text-muted-foreground tabular-nums">Atualizado em {formatDateTimeSafe(payment.atualizadoEm)}</p>
        {payment.estornoMotivo && <p className="text-xs text-muted-foreground">Motivo: {getReasonLabel(payment.estornoMotivo)}</p>}
      </TableCell>
      <TableCell>
        <PaymentStatusBadge status={payment.status} />
      </TableCell>
      <TableCell className="whitespace-normal tabular-nums">
        <p>{formatCurrency(payment.valorCentavos)}</p>
        {mismatch && payment.valorGatewayCentavos !== null && (
          <p className="text-xs text-destructive">Recebido: {formatCurrency(payment.valorGatewayCentavos)}</p>
        )}
      </TableCell>
      <TableCell>
        {canManage && (payment.acoes.conciliar || payment.acoes.estornar) && (
          <div className="flex flex-col justify-end gap-2 sm:flex-row">
            {payment.acoes.conciliar && <ReconcilePaymentButton paymentId={payment.id} onDone={onChanged} />}
            {payment.acoes.estornar && <RefundPaymentButton paymentId={payment.id} valorCentavos={payment.valorCentavos} onDone={onChanged} />}
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}
