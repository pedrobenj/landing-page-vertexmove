import type { Metadata } from "next"
import { Suspense } from "react"

import { ShirtSizesSection, ShirtSizesSectionSkeleton } from "./components"

export const metadata: Metadata = { title: "Tamanhos de camisa" }

export default function AdminShirtSizesPage() {
  return (
    <section aria-labelledby="shirt-sizes-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 id="shirt-sizes-title" className="text-2xl font-extrabold text-brand-navy">
          Tamanhos de camisa
        </h1>
        <p className="text-sm text-muted-foreground">Catálogo usado por todas as corridas.</p>
      </div>
      <Suspense fallback={<ShirtSizesSectionSkeleton />}>
        <ShirtSizesSection />
      </Suspense>
    </section>
  )
}
