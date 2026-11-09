import type { Metadata } from "next"
import { notFound, unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { ServerError } from "@/components/feedback"
import { StoreUnavailable } from "@/components/store/store-unavailable"
import { canManageStore } from "@/lib/utils/admin-permissions"
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

  let product: StoreProduct
  try {
    product = await getAdminProduct(id)
  } catch (error) {
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) notFound()
    if (!isStoreUnavailable(error)) console.error("[EditProductPage]", error instanceof Error ? error.name : "erro desconhecido")
    return (
      <section className="flex flex-col gap-6">
        <h1 className="text-2xl font-extrabold text-brand-navy">Editar produto</h1>
        {isStoreUnavailable(error) ? <StoreUnavailable context="admin" /> : <ServerError title="Não foi possível carregar o produto" />}
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <EditProduct product={product} canManage={canManageStore(admin.papel)} />
    </section>
  )
}
