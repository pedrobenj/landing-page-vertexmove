import { TicketPercent } from "lucide-react"

import { CopyCouponButton } from "./copy-coupon-button"

interface PartnerRaceCouponProps {
  code: string
  discountPercent: number
}

/** Caixa do cupom exclusivo: rótulo, código grande, desconto e botão de copiar. */
export function PartnerRaceCoupon({ code, discountPercent }: PartnerRaceCouponProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-green/60 bg-brand-green/10 p-3">
      <div className="flex min-w-0 flex-col">
        <p className="flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-widest text-brand-green-text">
          <TicketPercent aria-hidden="true" className="size-3.5" />
          Cupom
        </p>
        <p className="truncate font-heading text-lg font-black tracking-wide text-brand-navy-deep">{code}</p>
        <p className="text-xs text-muted-foreground">{discountPercent}% de desconto</p>
      </div>
      <CopyCouponButton code={code} />
    </div>
  )
}
