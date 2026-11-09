import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface ArrowLinkProps {
  href: string
  children: ReactNode
  className?: string
}

/** Link de texto com seta (ex.: "Garantir minha vaga →"). A cor vem do chamador. */
export function ArrowLink({ href, children, className }: ArrowLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group/arrow inline-flex w-fit items-center gap-1.5 font-bold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
        className,
      )}
    >
      {children}
      <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover/arrow:translate-x-0.5" />
    </Link>
  )
}
