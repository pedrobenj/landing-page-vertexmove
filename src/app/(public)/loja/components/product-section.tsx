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
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-20 flex-col gap-4">
      <h2 id={`${id}-title`} className="text-2xl font-extrabold text-brand-navy uppercase">
        {title}
      </h2>
      {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
      <ProductGrid products={products} />
    </section>
  )
}
