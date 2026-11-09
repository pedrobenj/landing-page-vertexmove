import { Info, MapPin } from "lucide-react"

import { ProductImage, SoldOutBadge } from "@/components/store"
import { PRODUCT_TYPE, PRODUCT_TYPE_LABEL } from "@/enums/product-type.enum"
import { formatCurrency, isProductSoldOut } from "@/lib/utils"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductPurchaseForm } from "./product-purchase-form"

interface ProductDetailsProps {
  product: StoreProduct
}

const MEDAL_NOTICE = "Compra apenas da medalha física — não gera inscrição em nenhuma corrida."

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      <ProductImage
        src={product.imageUrls[0] ?? null}
        alt={product.name}
        type={product.type}
        sizes="(min-width: 768px) 50vw, 100vw"
        priority
        className="rounded-2xl border shadow-sm"
      />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-green-text uppercase">{PRODUCT_TYPE_LABEL[product.type]}</p>
          <h1 className="font-heading text-3xl leading-[1.05] font-black tracking-tight text-brand-navy-deep sm:text-4xl">
            {product.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-heading text-2xl font-black text-brand-navy-deep tabular-nums">{formatCurrency(product.price)}</p>
            {isProductSoldOut(product) && <SoldOutBadge />}
          </div>
        </div>
        <p className="leading-relaxed text-muted-foreground">{product.description}</p>
        {product.type === PRODUCT_TYPE.MEDAL && (
          <p role="note" className="flex gap-2 rounded-xl border border-brand-green/40 bg-brand-green/10 p-3 text-sm font-medium text-brand-navy-deep">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-green-text" />
            {MEDAL_NOTICE}
          </p>
        )}
        <ProductPurchaseForm variants={product.variants} />
        <p className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 text-brand-green-text" aria-hidden="true" />
          <span>
            <strong className="text-foreground">Retirada:</strong> {product.pickupInfo}
          </span>
        </p>
      </div>
    </div>
  )
}
