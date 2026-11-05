import { Construction } from "lucide-react"

import { Eyebrow } from "@/components/brand"

interface PagePlaceholderProps {
  title: string
  description: string
}

/** Marcador temporário para rotas ainda não implementadas. Remover conforme as páginas forem construídas. */
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-20 text-center">
      <Eyebrow>Em construção</Eyebrow>
      <h1 className="text-3xl font-extrabold uppercase text-brand-navy">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <Construction className="size-10 text-muted-foreground" aria-hidden="true" />
    </section>
  )
}
