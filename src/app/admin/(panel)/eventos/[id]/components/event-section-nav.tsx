import { getAdminEventSections } from "@/lib/utils/admin-event-sections"

import { EventSectionNavLink } from "./event-section-nav-link"

interface EventSectionNavProps {
  eventId: number
}

/** Atalhos para os cadastros ligados à corrida. */
export function EventSectionNav({ eventId }: EventSectionNavProps) {
  return (
    <nav aria-label="Cadastros da corrida">
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {getAdminEventSections(eventId).map((section) => (
          <EventSectionNavLink key={section.href} section={section} />
        ))}
      </ul>
    </nav>
  )
}
