import type { ProductType } from "@/generated/prisma/enums"

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
  type: ProductType
  imageUrls: string[]
  /** centavos */
  price: number
  pickupInfo: string
  isActive: boolean
  isFeatured: boolean
  variants: StoreVariant[]
}
