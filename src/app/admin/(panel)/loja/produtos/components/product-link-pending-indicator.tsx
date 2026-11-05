"use client"

import { Loader2 } from "lucide-react"
import { useLinkStatus } from "next/link"

import { cn } from "@/lib/utils"

/** Feedback enquanto a página de edição (que bloqueia para dar 404 real) carrega. */
export function ProductLinkPendingIndicator() {
  const { pending } = useLinkStatus()
  return (
    <Loader2
      aria-hidden="true"
      className={cn("size-4 text-brand-navy opacity-0 transition-opacity duration-200", pending && "animate-spin opacity-100")}
    />
  )
}
