import { requireAdminSession } from "@/server/api/require-admin-session"

import { StoreOrdersList } from "./store-orders-list"

/** Confere a sessão (o proxy é pulado em prefetch) antes de montar a lista client. */
export async function AdminStoreOrdersList() {
  await requireAdminSession()
  return <StoreOrdersList />
}
