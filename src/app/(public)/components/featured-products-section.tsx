import Link from "next/link"
import { Suspense } from "react"

import { ProductGridSkeleton } from "@/components/store"
import { Button } from "@/components/ui/button"

import { FeaturedProducts } from "./featured-products"
import { SectionHeading } from "./section-heading"

export function FeaturedProductsSection() {
  return (
    <section aria-labelledby="loja-title" className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14">
      <SectionHeading id="loja-title" eyebrow="Retire presencialmente" title="Loja Vertex" />
      <Suspense fallback={<ProductGridSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      <Button asChild variant="outline" size="lg" className="self-center">
        <Link href="/loja">Ver loja completa</Link>
      </Button>
    </section>
  )
}
