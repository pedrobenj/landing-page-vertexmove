import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

interface AdminBackLinkProps {
  href: string
  children: ReactNode
}

/** Link "voltar" sobre o navy do `AdminPageHero`. */
export function AdminBackLink({ href, children }: AdminBackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-white/70 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {children}
    </Link>
  )
}
