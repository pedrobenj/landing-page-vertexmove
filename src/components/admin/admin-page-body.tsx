import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface AdminPageBodyProps {
  children: ReactNode
  className?: string
}

/** Conteúdo branco abaixo do `AdminPageHero` (formulários, tabelas, cartões). */
export function AdminPageBody({ children, className }: AdminPageBodyProps) {
  return <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8", className)}>{children}</div>
}
