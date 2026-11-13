import { QrCode } from "lucide-react"

import { Chevron } from "@/components/brand"
import { PillBadge } from "@/components/sections"
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
      <header className="flex flex-col gap-3">
        <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand-green-text uppercase">
          <Chevron className="h-2.5 w-4 shrink-0 text-current" />
          Pedido da loja
        </p>
        <p className="text-muted-foreground">Olá, {order.buyerFirstName}! Seu pedido:</p>
        <h1 className="font-heading text-4xl leading-[1.05] font-black tracking-tight text-brand-navy-deep sm:text-5xl">{order.code}</h1>
        <PillBadge tone="soft">{ORDER_STATUS_LABEL[order.status]}</PillBadge>
      </header>

      {order.status === "PENDING" && (
        <section aria-labelledby="pix-title" className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-slate-50 p-6 text-center">
          <QrCode className="size-10 text-muted-foreground" aria-hidden="true" />
          <h2 id="pix-title" className="font-heading font-black text-brand-navy-deep">Pagamento via Pix</h2>
          {/* TODO (Etapa 2): QR Code, copia-e-cola e polling do status. */}
          <p className="text-sm text-muted-foreground">O pagamento via Pix será liberado em breve.</p>
          {order.expiresAt && (
            <p className="text-xs text-muted-foreground">Reserva válida até {formatDateTime(order.expiresAt)}.</p>
          )}
        </section>
      )}

      <section aria-labelledby="itens-title" className="flex flex-col gap-2 rounded-2xl border bg-card p-5 shadow-sm">
        <h2 id="itens-title" className="font-heading font-black text-brand-navy-deep">Itens</h2>
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
        <h2 id="retirada-title" className="font-heading font-black text-brand-navy-deep">Retirada</h2>
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
