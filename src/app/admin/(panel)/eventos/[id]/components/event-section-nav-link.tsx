import { ChevronRight } from "lucide-react"
import Link from "next/link"

import type { AdminEventSection } from "@/lib/utils/admin-event-sections"

interface EventSectionNavLinkProps {
  section: AdminEventSection
}

export function EventSectionNavLink({ section }: EventSectionNavLinkProps) {
  return (
    <li>
      <Link
        href={section.href}
        className="flex items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-muted"
      >
        {section.label}
        <ChevronRight className="size-4 text-brand-green-text" aria-hidden="true" />
      </Link>
    </li>
  )
}
