import type { PRODUCT_TYPE } from "@/enums/product-type.enum"

export interface StoreVariant {
  id: string
  label: string
  stock: number
}

export interface StoreProduct {
  id: string
  slug: string
  name: string
  description: string
  type: PRODUCT_TYPE
  imageUrls: string[]
  /** centavos */
  price: number
  pickupInfo: string
  isActive: boolean
  isFeatured: boolean
  variants: StoreVariant[]
}
