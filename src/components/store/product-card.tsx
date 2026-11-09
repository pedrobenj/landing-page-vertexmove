import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { PRODUCT_TYPE_LABEL } from "@/enums/product-type.enum"
import { cn, formatCurrency, isProductSoldOut } from "@/lib/utils"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductCardPendingIndicator } from "./product-card-pending-indicator"
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
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="relative">
        <ProductImage
          src={product.imageUrls[0] ?? null}
          alt={product.name}
          type={product.type}
          className={cn("rounded-none", soldOut && "opacity-60")}
        />
        {soldOut && (
          <div className="absolute top-3 left-3">
            <SoldOutBadge />
          </div>
        )}
        <ProductCardPendingIndicator />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <p className="text-[0.7rem] font-bold tracking-[0.15em] text-brand-green-text uppercase">{PRODUCT_TYPE_LABEL[product.type]}</p>
        <h3 className="font-heading leading-snug font-black text-brand-navy-deep group-hover:underline">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="font-heading text-base font-black text-brand-navy-deep tabular-nums sm:text-lg">{formatCurrency(product.price)}</p>
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-green text-brand-navy-deep transition-transform group-hover:translate-x-0.5"
          >
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
