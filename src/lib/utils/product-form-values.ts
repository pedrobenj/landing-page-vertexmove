import type { ProductFormInput } from "@/lib/validations/product.schema"
import type { StoreProduct } from "@/types/store-product.interface"

import { formatCentsInput } from "./currency-input"

export const EMPTY_PRODUCT_FORM: ProductFormInput = {
  name: "",
  slug: "",
  description: "",
  type: "SHIRT",
  price: "",
  pickupInfo: "",
  isActive: true,
  isFeatured: false,
  variants: [
    { label: "P", stock: "0" },
    { label: "M", stock: "0" },
    { label: "G", stock: "0" },
    { label: "GG", stock: "0" },
  ],
}

export function toProductFormValues(product: StoreProduct): ProductFormInput {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    type: product.type,
    price: formatCentsInput(product.price),
    pickupInfo: product.pickupInfo,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    // originalStock: o servidor aplica só a diferença editada, sem apagar reservas feitas durante a edição.
    variants: product.variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      stock: String(variant.stock),
      originalStock: String(variant.stock),
    })),
  }
}
