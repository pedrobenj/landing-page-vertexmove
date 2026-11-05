import type { Metadata } from "next"
import { Suspense } from "react"

import { Eyebrow } from "@/components/brand"
import { ProductGridSkeleton } from "@/components/store"

import { StoreCatalog, StoreSectionNav } from "./components"

export const metadata: Metadata = {
  title: "Loja",
  description: "Camisas e medalhas do Vertex Grupo de Corrida. Pague com Pix e retire presencialmente.",
}

export default function StorePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col items-start gap-3">
        <Eyebrow className="justify-start">Loja Vertex</Eyebrow>
        <h1 className="text-3xl font-extrabold text-brand-navy uppercase sm:text-4xl">Camisas e medalhas</h1>
        <p className="text-muted-foreground">Pague com Pix e retire presencialmente — sem frete.</p>
        <StoreSectionNav />
      </header>
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <StoreCatalog />
      </Suspense>
    </div>
  )
}
