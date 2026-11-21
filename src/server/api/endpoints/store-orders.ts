import "server-only"

import type { ORDER_STATUS } from "@/enums/order-status.enum"
import type { STORE_ORDER_ACTION } from "@/enums/store-order-action.enum"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { ApiAdminStoreOrder, ApiAdminStoreOrderDetails } from "@/types/api/store-order.interface"

import { adminFetch } from "../admin-fetch"
import { requireAdminSession } from "../require-admin-session"
import { ensureStoreEnabled } from "./store"

// Pedidos da loja no admin (Bearer, `AdminAuthGuard`). Sem cache: o status muda com o webhook e a retirada.

/** `GET /admin/loja/pedidos?status&cursor&limit` — mais recentes primeiro. */
export async function listAdminStoreOrders(filters: { status?: ORDER_STATUS; cursor?: string }): Promise<CursorPage<ApiAdminStoreOrder>> {
  await requireAdminSession()
  ensureStoreEnabled()
  return adminFetch("/admin/loja/pedidos", { query: { status: filters.status, cursor: filters.cursor } })
}

/** `GET /admin/loja/pedidos/:codigo` — com nome, WhatsApp e e-mail (CPF mascarado). */
export async function getAdminStoreOrder(codigo: string): Promise<ApiAdminStoreOrderDetails> {
  await requireAdminSession()
  ensureStoreEnabled()
  return adminFetch(`/admin/loja/pedidos/${encodeURIComponent(codigo)}`)
}

/** `POST /admin/loja/pedidos/:codigo/<pronto|retirado|cancelar>` (204). Transição inválida → 409. */
export async function runStoreOrderAction(codigo: string, action: STORE_ORDER_ACTION): Promise<void> {
  await requireAdminSession()
  ensureStoreEnabled()
  await adminFetch(`/admin/loja/pedidos/${encodeURIComponent(codigo)}/${action}`, { method: "POST" })
}
