import { PastEventCardSkeleton } from "@/components/events"

const PLACEHOLDER_COUNT = 4

export function PastEventGridSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando corridas encerradas"
      className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4"
    >
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <PastEventCardSkeleton key={index} />
      ))}
    </div>
  )
}
