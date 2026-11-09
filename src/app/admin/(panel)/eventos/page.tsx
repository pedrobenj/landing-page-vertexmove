import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminEventsList, EventsListSkeleton, NewEventButton } from "./components"

export const metadata: Metadata = { title: "Corridas" }

export default function AdminEventsPage() {
  return (
    <section aria-labelledby="admin-events-title" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 id="admin-events-title" className="text-2xl font-extrabold text-brand-navy">
          Corridas
        </h1>
        <Suspense fallback={null}>
          <NewEventButton />
        </Suspense>
      </div>
      <Suspense fallback={<EventsListSkeleton />}>
        <AdminEventsList />
      </Suspense>
    </section>
  )
}
