import { Info } from "lucide-react"

import { ProductGrid } from "@/components/store"
import type { StoreProduct } from "@/types/store-product.interface"

interface ProductSectionProps {
  id: string
  title: string
  products: StoreProduct[]
  notice?: string
}

export function ProductSection({ id, title, products, notice }: ProductSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-24 flex-col gap-5">
      <h2 id={`${id}-title`} className="font-heading text-2xl font-black tracking-tight text-brand-navy-deep sm:text-3xl">
        {title}
      </h2>
      {notice && (
        <p className="flex gap-2 text-sm text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-green-text" />
          {notice}
        </p>
      )}
      <ProductGrid products={products} />
    </section>
  )
}
