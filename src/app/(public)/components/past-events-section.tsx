import { Suspense } from "react"

import { PastEvents } from "./past-events"
import { PastEventsSkeleton } from "./past-events-skeleton"

export function PastEventsSection() {
  return (
    <Suspense fallback={<PastEventsSkeleton />}>
      <PastEvents />
    </Suspense>
  )
}
