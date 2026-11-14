import { ArrowRight } from "lucide-react"
import Link from "next/link"

import type { AdminShortcut } from "@/lib/utils/admin-dashboard"

interface DashboardShortcutProps {
  shortcut: AdminShortcut
}

export function DashboardShortcut({ shortcut }: DashboardShortcutProps) {
  const Icon = shortcut.icon
  return (
    <li>
      <Link
        href={shortcut.href}
        className="group flex h-full items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:border-brand-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy-deep text-brand-green">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-heading font-bold text-brand-navy">{shortcut.label}</span>
          <span className="text-sm text-muted-foreground">{shortcut.description}</span>
        </span>
        <ArrowRight className="size-5 shrink-0 text-brand-green-text transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </li>
  )
}
