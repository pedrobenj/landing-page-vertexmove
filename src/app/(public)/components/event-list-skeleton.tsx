import { EventCardSkeleton } from "./event-card-skeleton"

const PLACEHOLDER_COUNT = 3

export function EventListSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando corridas" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  )
}
