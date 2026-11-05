import Link from "next/link"

import { formatCurrency, isProductSoldOut } from "@/lib/utils"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductImage } from "./product-image"
import { SoldOutBadge } from "./sold-out-badge"

interface ProductCardProps {
  product: StoreProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const soldOut = isProductSoldOut(product)
  return (
    <Link
      href={`/loja/${product.slug}`}
      className="group flex h-full flex-col gap-3 rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="relative">
        <ProductImage src={product.imageUrls[0] ?? null} alt={product.name} type={product.type} className={soldOut ? "opacity-60" : undefined} />
        {soldOut && (
          <div className="absolute top-2 left-2">
            <SoldOutBadge />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading font-bold text-brand-navy group-hover:underline">{product.name}</h3>
        <p className="text-sm font-semibold text-foreground">{formatCurrency(product.price)}</p>
      </div>
    </Link>
  )
}
