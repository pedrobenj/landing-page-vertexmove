"use client"

import { Loader2 } from "lucide-react"
import { useLinkStatus } from "next/link"

import { cn } from "@/lib/utils"

/** Feedback discreto enquanto a página do produto (que bloqueia para dar 404 real) carrega. */
export function ProductCardPendingIndicator() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center bg-white/40 opacity-0 transition-opacity duration-200",
        pending && "opacity-100",
      )}
    >
      <Loader2 className={cn("size-6 text-brand-navy", pending && "animate-spin")} />
    </span>
  )
}
