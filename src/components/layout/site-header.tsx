import Link from "next/link"
import { Suspense } from "react"

import { VertexLogoPlate } from "@/components/brand"

import { CartButton } from "./cart-button"
import { SiteNavSheet } from "./site-nav-sheet"
import { SiteNavSheetFallback } from "./site-nav-sheet-fallback"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-brand-navy-deep text-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          aria-label="Vertex Grupo de Corrida — início"
          className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
        >
          <VertexLogoPlate priority />
          <span aria-hidden="true" className="hidden font-heading text-lg font-extrabold sm:inline">
            Vertex
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <CartButton />
          <Suspense fallback={<SiteNavSheetFallback />}>
            <SiteNavSheet />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
