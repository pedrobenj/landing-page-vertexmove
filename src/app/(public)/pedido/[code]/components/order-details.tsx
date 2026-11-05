import { QrCode } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ORDER_STATUS_LABEL } from "@/enums/order-status.enum"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import type { OrderSummary } from "@/types/order.interface"

import { OrderItemRow } from "./order-item-row"
import { PickupInfoItem } from "./pickup-info-item"

interface OrderDetailsProps {
  order: OrderSummary
}

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Olá, {order.buyerFirstName}! Seu pedido:</p>
        <h1 className="font-heading text-3xl font-extrabold text-brand-navy">{order.code}</h1>
        <Badge className="w-fit">{ORDER_STATUS_LABEL[order.status]}</Badge>
      </header>

      {order.status === "PENDING" && (
        <section aria-labelledby="pix-title" className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center">
          <QrCode className="size-10 text-muted-foreground" aria-hidden="true" />
          <h2 id="pix-title" className="font-bold">Pagamento via Pix</h2>
          {/* TODO (Etapa 2): QR Code, copia-e-cola e polling do status. */}
          <p className="text-sm text-muted-foreground">O pagamento via Pix será liberado em breve.</p>
          {order.expiresAt && (
            <p className="text-xs text-muted-foreground">Reserva válida até {formatDateTime(order.expiresAt)}.</p>
          )}
        </section>
      )}

      <section aria-labelledby="itens-title" className="flex flex-col gap-2">
        <h2 id="itens-title" className="font-bold text-brand-navy">Itens</h2>
        <ul className="divide-y">
          {order.items.map((item) => (
            <OrderItemRow key={`${item.productName}-${item.variantLabel}`} item={item} />
          ))}
        </ul>
        <p className="flex justify-between border-t pt-3 font-bold">
          <span>Total</span>
          <span data-testid="order-total" className="tabular-nums">{formatCurrency(order.amount)}</span>
        </p>
      </section>

      <section aria-labelledby="retirada-title" className="flex flex-col gap-2">
        <h2 id="retirada-title" className="font-bold text-brand-navy">Retirada</h2>
        <ul className="flex flex-col gap-2">
          {order.pickupInfos.map((info) => (
            <PickupInfoItem key={info} info={info} />
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">Leve um documento com foto e o código do pedido.</p>
      </section>
    </div>
  )
}
