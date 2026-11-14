import type { ReactNode } from "react"

import { Chevron } from "@/components/brand"

interface AdminPageHeroProps {
  /** `id` do `h1`, para o `aria-labelledby` da seção. */
  id: string
  eyebrow: string
  title: string
  description?: ReactNode
  /** Acima do eyebrow (ex.: link "Voltar"). */
  before?: ReactNode
  /** Ao lado do título (ex.: selo de status). */
  badge?: ReactNode
  /** Botões: à direita no desktop, empilhados no mobile. */
  actions?: ReactNode
}

/**
 * Cabeçalho navy das páginas do admin: versão compacta do `PageHero` público (pico esmaecido, eyebrow
 * com o pico verde, `h1`), sem animação (CLAUDE.md §4: nada de Motion no admin).
 */
export function AdminPageHero({ id, eyebrow, title, description, before, badge, actions }: AdminPageHeroProps) {
  return (
    <section aria-labelledby={id} className="relative overflow-hidden border-t border-white/10 bg-brand-navy-deep text-white">
      <Chevron className="pointer-events-none absolute -right-10 -bottom-16 w-72 opacity-[0.07] lg:w-96" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8">
        {before}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand-green uppercase">
              <Chevron className="h-2.5 w-4 shrink-0 text-current" />
              {eyebrow}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 id={id} className="font-heading text-3xl leading-tight font-black tracking-tight break-words sm:text-4xl">
                {title}
              </h1>
              {badge}
            </div>
            {description && <div className="text-sm text-white/75 sm:text-base">{description}</div>}
          </div>
          {actions && <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap md:justify-end">{actions}</div>}
        </div>
      </div>
    </section>
  )
}
