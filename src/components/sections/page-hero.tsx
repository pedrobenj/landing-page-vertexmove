import type { ReactNode } from "react"

import { Chevron } from "@/components/brand"
import { cn } from "@/lib/utils"

import { SectionHeading } from "./section-heading"

interface PageHeroProps {
  id: string
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  /** Acima do título (ex.: link "Voltar"). */
  before?: ReactNode
  /** Largura do conteúdo, para acompanhar o corpo da página (ex.: `max-w-3xl`). */
  containerClassName?: string
}

/**
 * Cabeçalho navy das páginas de conteúdo, com o pico gigante esmaecido: mesma linguagem do hero da
 * home (CLAUDE.md §2). O título é o `h1` da página. Fluxos de tarefa (inscrição, pagamento,
 * checkout) não usam: ficam brancos para manter o foco.
 */
export function PageHero({ id, eyebrow, title, description, actions, before, containerClassName }: PageHeroProps) {
  return (
    <section aria-labelledby={id} className="relative overflow-hidden bg-brand-navy-deep text-white">
      <Chevron className="pointer-events-none absolute -right-16 -bottom-20 w-[26rem] opacity-[0.07] lg:w-[36rem]" />
      <div className={cn("relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:py-16", containerClassName)}>
        {before}
        <SectionHeading as="h1" id={id} tone="dark" eyebrow={eyebrow} title={title} description={description} actions={actions} />
      </div>
    </section>
  )
}
