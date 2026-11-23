import { requireAdminSession } from "@/server/api/require-admin-session"

import { LgpdRequestsList } from "./lgpd-requests-list"

/** Confere a sessão (o proxy é pulado em prefetch) antes de montar a lista client. */
export async function AdminLgpdList() {
  await requireAdminSession()
  return <LgpdRequestsList />
}
