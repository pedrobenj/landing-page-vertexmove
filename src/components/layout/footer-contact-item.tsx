import type { LucideIcon } from "lucide-react"

interface FooterContactItemProps {
  icon: LucideIcon
  label: string
  /** Texto exibido. Vazio → "em breve" (contato ainda não configurado). */
  value: string
  href?: string
  external?: boolean
}

export function FooterContactItem({ icon: Icon, label, value, href, external = false }: FooterContactItemProps) {
  const content = (
    <>
      <Icon className="size-4 shrink-0 text-brand-green" aria-hidden="true" />
      <span className="sr-only">{label}: </span>
      {value || <span className="text-white/60">{label} em breve</span>}
    </>
  )

  return (
    <li>
      {value && href ? (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="inline-flex items-center gap-2.5 text-white/80 transition-colors hover:text-brand-green"
        >
          {content}
        </a>
      ) : (
        <span className="inline-flex items-center gap-2.5 text-white/80">{content}</span>
      )}
    </li>
  )
}
