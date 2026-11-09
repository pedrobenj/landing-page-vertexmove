import Image from "next/image"

import { cn, getInitials } from "@/lib/utils"
import type { Partner } from "@/types/partner.interface"

interface PartnerLogoCardProps {
  partner: Partner
  className?: string
}

/** Caixa branca com a logo do parceiro; sem logo → monograma com o nome. Com `url`, vira link externo. */
export function PartnerLogoCard({ partner, className }: PartnerLogoCardProps) {
  const content = partner.logoUrl ? (
    <Image src={partner.logoUrl} alt={partner.nome} fill sizes="200px" className="object-contain p-5" />
  ) : (
    <span className="flex flex-col items-center gap-2 px-3 text-center">
      <span
        aria-hidden="true"
        className="flex size-11 items-center justify-center rounded-full bg-brand-navy-deep font-heading text-sm font-black text-brand-green"
      >
        {getInitials(partner.nome)}
      </span>
      <span className="font-heading text-sm leading-tight font-bold text-brand-navy-deep">{partner.nome}</span>
    </span>
  )

  const boxClassName = cn(
    "relative flex h-32 items-center justify-center overflow-hidden rounded-2xl border bg-white shadow-xs",
    className,
  )

  if (!partner.url) return <div className={boxClassName}>{content}</div>

  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(boxClassName, "transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand-green")}
    >
      {content}
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  )
}
