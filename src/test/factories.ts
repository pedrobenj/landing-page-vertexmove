import { PRODUCT_TYPE } from "@/enums/product-type.enum"
import type { StoreProduct } from "@/types/store-product.interface"

export function buildProduct(overrides: Partial<StoreProduct> = {}): StoreProduct {
  return {
    id: "p1",
    slug: "camisa-teste",
    name: "Camisa Teste",
    description: "Camisa para testes automatizados.",
    type: PRODUCT_TYPE.SHIRT,
    imageUrls: [],
    price: 8990,
    pickupInfo: "Retirada na sede",
    isActive: true,
    isFeatured: false,
    variants: [
      { id: "p1-p", label: "P", stock: 5 },
      { id: "p1-m", label: "M", stock: 0 },
    ],
    ...overrides,
  }
}
