import { ShoppingBag } from "lucide-react"
import { connection } from "next/server"

import { EmptyState, ServerError } from "@/components/feedback"
import { PRODUCT_TYPE_SECTION } from "@/enums/product-type.enum"
import { getStoreRepository } from "@/server/repositories/store.repository"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductSection } from "./product-section"

const MEDAL_NOTICE = "A compra é apenas da medalha física e não gera inscrição em nenhuma corrida."

export async function StoreCatalog() {
  await connection()

  let products: StoreProduct[]
  try {
    products = await getStoreRepository().listActiveProducts()
  } catch (error) {
    console.error("[StoreCatalog]", error)
    return <ServerError title="Não foi possível carregar a loja" />
  }

  if (products.length === 0) {
    return <EmptyState icon={ShoppingBag} title="Nenhum produto disponível no momento." description="Volte em breve!" />
  }

  const shirts = products.filter((product) => product.type === "SHIRT")
  const medals = products.filter((product) => product.type === "MEDAL")

  return (
    <div className="flex flex-col gap-12">
      {shirts.length > 0 && <ProductSection id={PRODUCT_TYPE_SECTION.SHIRT.anchor} title={PRODUCT_TYPE_SECTION.SHIRT.title} products={shirts} />}
      {medals.length > 0 && (
        <ProductSection id={PRODUCT_TYPE_SECTION.MEDAL.anchor} title={PRODUCT_TYPE_SECTION.MEDAL.title} products={medals} notice={MEDAL_NOTICE} />
      )}
    </div>
  )
}
