import { PastEventCardSkeleton } from "@/components/events"

import { PastEventsBand } from "./past-events-band"

const PLACEHOLDER_COUNT = 3

export function PastEventsSkeleton() {
  return (
    <PastEventsBand>
      <div role="status" aria-busy="true" aria-label="Carregando corridas encerradas" className="grid grid-cols-[78%] gap-4 overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
          <PastEventCardSkeleton key={index} />
        ))}
      </div>
    </PastEventsBand>
  )
}
