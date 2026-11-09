import type { ReactNode } from "react"

import { ArrowLink, CoverImage } from "@/components/sections"

interface HighlightCardProps {
  title: string
  description: string
  badge: ReactNode
  linkLabel: string
  href: string
  /** TODO(cliente): fotos reais para os cards de destaque. */
  imageSrc?: string
}

/** Card de destaque do topo: foto (ou capa da marca) com sobreposição escura, selo, título e link. */
export function HighlightCard({ title, description, badge, linkLabel, href, imageSrc }: HighlightCardProps) {
  return (
    <article className="relative isolate flex min-h-60 flex-col justify-end md:min-h-80 overflow-hidden rounded-2xl bg-brand-navy-deep p-6 text-white shadow-md">
      <CoverImage src={imageSrc} alt="" sizes="(min-width: 768px) 33vw, 100vw" className="-z-10" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-brand-navy-deep/45" />
      <div className="flex flex-col gap-2">
        {badge}
        <h3 className="font-heading text-4xl font-black">{title}</h3>
        <p className="text-sm text-white/85">{description}</p>
        <ArrowLink href={href} className="mt-2 text-brand-green">
          {linkLabel}
        </ArrowLink>
      </div>
    </article>
  )
}
