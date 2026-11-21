import type { Metadata } from "next"
import { notFound, unstable_rethrow } from "next/navigation"
import { connection } from "next/server"

import { AdminBackLink, AdminPageBody, AdminPageHero } from "@/components/admin"
import { ServerError } from "@/components/feedback"
import { StoreUnavailable } from "@/components/store/store-unavailable"
import { canManageStore } from "@/lib/utils/admin-permissions"
import { isOrderCode } from "@/lib/utils/is-order-code"
import { isApiError } from "@/server/api/api-error"
import { getAdminStoreOrder } from "@/server/api/endpoints/store-orders"
import { isStoreUnavailable } from "@/server/api/is-store-unavailable"
import { requireAdminSession } from "@/server/api/require-admin-session"
import type { ApiAdminStoreOrderDetails } from "@/types/api/store-order.interface"

import { StoreOrderStatusBadge } from "../components"
import { StoreOrderActions, StoreOrderDetails } from "./components"

/** Bloqueia (sem <Suspense>) até ler o pedido: o `notFound()` roda antes do streaming e devolve 404 de verdade. */
export const instant = false

export const metadata: Metadata = { title: "Pedido da loja" }

const BACK_LINK = <AdminBackLink href="/admin/loja/pedidos">Pedidos</AdminBackLink>

export default async function AdminStoreOrderPage({ params }: PageProps<"/admin/loja/pedidos/[codigo]">) {
  await connection()
  // Autorização aqui, e não só no proxy (pulado em prefetch). Fora do try/catch: o redirect sobe.
  const admin = await requireAdminSession()
  const codigo = (await params).codigo.toUpperCase()
  if (!isOrderCode(codigo)) notFound()

  let order: ApiAdminStoreOrderDetails
  try {
    order = await getAdminStoreOrder(codigo)
  } catch (error) {
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) notFound()
    if (!isStoreUnavailable(error)) console.error("[AdminStoreOrderPage]", error instanceof Error ? error.name : "erro desconhecido")
    return (
      <>
        <AdminPageHero id="admin-store-order-title" eyebrow="Pedido da loja" title={codigo} before={BACK_LINK} />
        <AdminPageBody>
          {isStoreUnavailable(error) ? <StoreUnavailable context="admin" /> : <ServerError title="Não foi possível carregar o pedido" />}
        </AdminPageBody>
      </>
    )
  }

  return (
    <>
      <AdminPageHero
        id="admin-store-order-title"
        eyebrow="Pedido da loja"
        title={order.codigo}
        before={BACK_LINK}
        badge={<StoreOrderStatusBadge status={order.status} />}
      />
      <AdminPageBody>
        <StoreOrderDetails order={order} />
        {canManageStore(admin.papel) && <StoreOrderActions codigo={order.codigo} status={order.status} />}
      </AdminPageBody>
    </>
  )
}
