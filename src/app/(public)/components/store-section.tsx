import { Suspense } from "react"

import { ProductGridSkeleton } from "@/components/store"
import { isStoreEnabled } from "@/server/api/endpoints/store"

import { StoreBand } from "./store-band"
import { StoreHighlights } from "./store-highlights"

/** Loja na home, logo depois da comunidade. Com `STORE_ENABLED=false` a seção nem aparece. */
export function StoreSection() {
  if (!isStoreEnabled()) return null

  return (
    <Suspense
      fallback={
        <StoreBand>
          <ProductGridSkeleton count={4} />
        </StoreBand>
      }
    >
      <StoreHighlights />
    </Suspense>
  )
}
