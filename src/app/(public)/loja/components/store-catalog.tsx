import { SearchX, ShoppingBag } from "lucide-react"
import { unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { EmptyState, ServerError } from "@/components/feedback"
import { ArrowLink } from "@/components/sections"
import { StoreUnavailable } from "@/components/store"
import { PRODUCT_TYPE, PRODUCT_TYPE_SECTION } from "@/enums/product-type.enum"
import { parseStoreFilter } from "@/lib/utils"
import { listStoreProducts } from "@/server/api/endpoints/store"
import { isStoreUnavailable } from "@/server/api/is-store-unavailable"
import type { StoreProduct } from "@/types/store-product.interface"

import { ProductSection } from "./product-section"
import { StoreSectionNav } from "./store-section-nav"

interface StoreCatalogProps {
  searchParams: PageProps<"/loja">["searchParams"]
}

export async function StoreCatalog({ searchParams }: StoreCatalogProps) {
  await connection()
  const activeType = parseStoreFilter((await searchParams).tipo)

  let products: StoreProduct[]
  try {
    products = await listStoreProducts()
  } catch (error) {
    unstable_rethrow(error)
    if (isStoreUnavailable(error)) return <StoreUnavailable />
    console.error("[StoreCatalog]", error instanceof Error ? error.name : "erro desconhecido")
    return <ServerError title="Não foi possível carregar a loja" />
  }

  if (products.length === 0) {
    return <EmptyState icon={ShoppingBag} title="Nenhum produto disponível no momento." description="Volte em breve!" />
  }

  const showShirts = activeType === null || activeType === PRODUCT_TYPE.SHIRT
  const shirts = showShirts ? products.filter((product) => product.type === PRODUCT_TYPE.SHIRT) : []

  return (
    <div className="flex flex-col gap-10">
      <StoreSectionNav activeType={activeType} />
      {shirts.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="Nenhum produto nesta categoria no momento."
          action={
            <ArrowLink href="/loja" className="text-brand-green-text">
              Ver todos os produtos
            </ArrowLink>
          }
        />
      )}
      {shirts.length > 0 && (
        <ProductSection
          id={PRODUCT_TYPE_SECTION[PRODUCT_TYPE.SHIRT].anchor}
          title={PRODUCT_TYPE_SECTION[PRODUCT_TYPE.SHIRT].title}
          products={shirts}
        />
      )}
    </div>
  )
}
