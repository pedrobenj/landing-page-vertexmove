import { formatCurrency } from "@/lib/utils/format-currency"
import { formatDateTimeSafe } from "@/lib/utils/format-date"
import { formatPhoneDisplay } from "@/lib/utils/format-phone-display"
import type { ApiAdminStoreOrderDetails } from "@/types/api/store-order.interface"

import { StoreOrderInfoRow } from "./store-order-info-row"
import { StoreOrderItemRow } from "./store-order-item-row"
import { StoreOrderPickupItem } from "./store-order-pickup-item"

interface StoreOrderDetailsProps {
  order: ApiAdminStoreOrderDetails
}

/** Comprador (com contato, CPF mascarado), itens com preço congelado, retirada e datas. */
export function StoreOrderDetails({ order }: StoreOrderDetailsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="buyer-title" className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
        <h2 id="buyer-title" className="font-heading font-black text-brand-navy-deep">Comprador</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <StoreOrderInfoRow label="Nome" value={order.nomeCompleto} />
          <StoreOrderInfoRow label="WhatsApp" value={formatPhoneDisplay(order.whatsapp)} />
          <StoreOrderInfoRow label="E-mail" value={order.email} />
          <StoreOrderInfoRow label="CPF" value={order.cpfMascarado} />
        </dl>
      </section>

      <section aria-labelledby="dates-title" className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
        <h2 id="dates-title" className="font-heading font-black text-brand-navy-deep">Andamento</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <StoreOrderInfoRow label="Criado em" value={formatDateTimeSafe(order.criadoEm)} />
          {order.expiraEm && <StoreOrderInfoRow label="Reserva até" value={formatDateTimeSafe(order.expiraEm)} />}
          <StoreOrderInfoRow label="Pago em" value={order.pagoEm ? formatDateTimeSafe(order.pagoEm) : "—"} />
          <StoreOrderInfoRow label="Retirado em" value={order.retiradoEm ? formatDateTimeSafe(order.retiradoEm) : "—"} />
        </dl>
      </section>

      <section aria-labelledby="items-title" className="flex flex-col gap-2 rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
        <h2 id="items-title" className="font-heading font-black text-brand-navy-deep">Itens</h2>
        <ul className="divide-y">
          {order.itens.map((item) => (
            <StoreOrderItemRow key={`${item.produtoNome}-${item.varianteRotulo}`} item={item} />
          ))}
        </ul>
        <p className="flex justify-between border-t pt-3 font-bold">
          <span>Total</span>
          <span data-testid="admin-order-total" className="tabular-nums">{formatCurrency(order.valorTotalCentavos)}</span>
        </p>
      </section>

      <section aria-labelledby="pickup-title" className="flex flex-col gap-2 lg:col-span-2">
        <h2 id="pickup-title" className="font-heading font-black text-brand-navy-deep">Retirada</h2>
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {order.retiradas.map((info) => (
            <StoreOrderPickupItem key={info} info={info} />
          ))}
        </ul>
      </section>
    </div>
  )
}
