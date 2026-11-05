import { MapPin } from "lucide-react"

import { ProductImage, SoldOutBadge } from "@/components/store"
import { ProductType } from "@/enums/product-type.enum"
import { formatCurrency, isProductSoldOut } from "@/lib/utils"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductPurchaseForm } from "./product-purchase-form"

interface ProductDetailsProps {
  product: StoreProduct
}

const MEDAL_NOTICE = "Compra apenas da medalha física — não gera inscrição em nenhuma corrida."

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ProductImage src={product.imageUrls[0] ?? null} alt={product.name} type={product.type} sizes="(min-width: 768px) 50vw, 100vw" priority />
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          {isProductSoldOut(product) && <SoldOutBadge />}
          <h1 className="text-3xl font-extrabold text-brand-navy uppercase">{product.name}</h1>
          <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>
        </div>
        <p className="text-muted-foreground">{product.description}</p>
        {product.type === ProductType.MEDAL && (
          <p role="note" className="rounded-lg border border-brand-green/40 bg-brand-green/10 p-3 text-sm font-medium text-brand-navy">
            {MEDAL_NOTICE}
          </p>
        )}
        <ProductPurchaseForm variants={product.variants} />
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-foreground">Retirada:</strong> {product.pickupInfo}
          </span>
        </p>
      </div>
    </div>
  )
}
