import { ProductType } from "@/generated/prisma/enums"

export { ProductType }

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  SHIRT: "Camisa",
  MEDAL: "Medalha",
}

export const PRODUCT_TYPE_SECTION: Record<ProductType, { title: string; anchor: string }> = {
  SHIRT: { title: "Camisas", anchor: "camisas" },
  MEDAL: { title: "Medalhas", anchor: "medalhas" },
}
