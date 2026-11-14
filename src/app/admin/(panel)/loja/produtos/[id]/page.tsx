import type { Metadata } from "next"
import { notFound, unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { AdminPageBody, AdminPageHero } from "@/components/admin"
import { ServerError } from "@/components/feedback"
import { StoreUnavailable } from "@/components/store/store-unavailable"
import { canManageStore } from "@/lib/utils/admin-permissions"
import { isOpaqueIdParam } from "@/lib/utils/is-opaque-id-param"
import { isApiError } from "@/server/api/api-error"
import { getAdminProduct } from "@/server/api/endpoints/store"
import { isStoreUnavailable } from "@/server/api/is-store-unavailable"
import { requireAdminSession } from "@/server/api/require-admin-session"
import type { StoreProduct } from "@/types/store-product.interface"

import { EditProduct } from "./components"

/**
 * A página bloqueia (sem <Suspense>) até ler o produto: assim o `notFound()` roda antes do streaming
 * começar e devolve um 404 de verdade (mesmo padrão de /loja/[slug]).
 */
export const instant = false

export const metadata: Metadata = { title: "Editar produto" }

export default async function EditProductPage({ params }: PageProps<"/admin/loja/produtos/[id]">) {
  await connection()
  // Autorização aqui, e não só no proxy (pulado em prefetch). Fora do try/catch: o redirect sobe.
  const admin = await requireAdminSession()
  const { id } = await params
  // Ids de produto são strings opacas (não numéricas como os da API de corridas): valida o formato.
  if (!isOpaqueIdParam(id)) notFound()

  let product: StoreProduct
  try {
    product = await getAdminProduct(id)
  } catch (error) {
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) notFound()
    if (!isStoreUnavailable(error)) console.error("[EditProductPage]", error instanceof Error ? error.name : "erro desconhecido")
    return (
      <>
        <AdminPageHero id="edit-product-title" eyebrow="Loja" title="Editar produto" />
        <AdminPageBody>
          {isStoreUnavailable(error) ? <StoreUnavailable context="admin" /> : <ServerError title="Não foi possível carregar o produto" />}
        </AdminPageBody>
      </>
    )
  }

  return <EditProduct product={product} canManage={canManageStore(admin.papel)} />
}
