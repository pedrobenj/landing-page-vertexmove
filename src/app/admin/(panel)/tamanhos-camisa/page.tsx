import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminPageBody, AdminPageHero } from "@/components/admin"

import { ShirtSizesSection, ShirtSizesSectionSkeleton } from "./components"

export const metadata: Metadata = { title: "Tamanhos de camisa" }

export default function AdminShirtSizesPage() {
  return (
    <>
      <AdminPageHero
        id="shirt-sizes-title"
        eyebrow="Catálogo"
        title="Tamanhos de camisa"
        description="Catálogo usado por todas as corridas."
      />
      <AdminPageBody>
        <Suspense fallback={<ShirtSizesSectionSkeleton />}>
          <ShirtSizesSection />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
