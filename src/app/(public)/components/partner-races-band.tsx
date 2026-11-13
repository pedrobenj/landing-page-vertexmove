import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { Chevron } from "@/components/brand"

interface PartnerRacesBandProps {
  children: ReactNode
}

/** Bloco "Outras trilhas" da home (conteúdo e skeleton), ao lado da loja. */
export function PartnerRacesBand({ children }: PartnerRacesBandProps) {
  return (
    <section aria-labelledby="parceiras-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-green-text">
            <Chevron className="h-2.5 w-4 shrink-0 text-current" />
            Provas parceiras
          </p>
          <h2 id="parceiras-title" className="font-heading text-3xl font-black text-brand-navy-deep sm:text-4xl">
            Outras trilhas, com desconto
          </h2>
        </div>
        <Link
          href="/corridas-parceiras"
          className="flex items-center gap-1 text-sm font-semibold text-brand-navy-deep hover:text-brand-green-text focus-visible:outline-2 focus-visible:outline-brand-green"
        >
          Ver todas
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      {children}
    </section>
  )
}
