import Image from "next/image"

import { Chevron } from "@/components/brand"
import { PRODUCT_TYPE_LABEL } from "@/enums/product-type.enum"
import type { ProductType } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"

interface ProductImageProps {
  src: string | null
  alt: string
  type: ProductType
  className?: string
  sizes?: string
  priority?: boolean
}

// TODO: liberar o host do storage (Blob/R2) em images.remotePatterns no next.config.ts.
export function ProductImage({ src, alt, type, className, sizes = "(min-width: 1024px) 25vw, 50vw", priority }: ProductImageProps) {
  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-xl bg-brand-navy", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-white/80">
          <Chevron className="w-16" />
          <span className="text-xs font-semibold tracking-widest uppercase">{PRODUCT_TYPE_LABEL[type]}</span>
        </div>
      )}
    </div>
  )
}
