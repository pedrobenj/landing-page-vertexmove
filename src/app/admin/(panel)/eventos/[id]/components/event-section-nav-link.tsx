import { ChevronRight } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import type { AdminEventSection } from "@/lib/utils/admin-event-sections"

interface EventSectionNavLinkProps {
  section: AdminEventSection
}

const ITEM_CLASS = "flex items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-semibold"

export function EventSectionNavLink({ section }: EventSectionNavLinkProps) {
  if (section.comingSoon) {
    return (
      <li className={`${ITEM_CLASS} text-muted-foreground`}>
        {section.label}
        <Badge variant="secondary">Em breve</Badge>
      </li>
    )
  }

  return (
    <li>
      <Link href={section.href} className={`${ITEM_CLASS} text-brand-navy transition-colors hover:bg-muted`}>
        {section.label}
        <ChevronRight className="size-4 text-brand-green-text" aria-hidden="true" />
      </Link>
    </li>
  )
}
