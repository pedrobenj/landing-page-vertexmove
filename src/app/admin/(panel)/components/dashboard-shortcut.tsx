import { ArrowRight } from "lucide-react"
import Link from "next/link"

import type { AdminShortcut } from "@/lib/utils/admin-dashboard"

interface DashboardShortcutProps {
  shortcut: AdminShortcut
}

export function DashboardShortcut({ shortcut }: DashboardShortcutProps) {
  return (
    <li>
      <Link
        href={shortcut.href}
        className="group flex h-full items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:border-brand-green"
      >
        <span className="flex flex-col gap-0.5">
          <span className="font-heading font-bold text-brand-navy">{shortcut.label}</span>
          <span className="text-sm text-muted-foreground">{shortcut.description}</span>
        </span>
        <ArrowRight className="size-5 shrink-0 text-brand-green-text" aria-hidden="true" />
      </Link>
    </li>
  )
}
