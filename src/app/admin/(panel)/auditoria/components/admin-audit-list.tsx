import { requireAdminSession } from "@/server/api/require-admin-session"

import { AuditList } from "./audit-list"

/** Confere a sessão (o proxy é pulado em prefetch) antes de montar a lista client. */
export async function AdminAuditList() {
  await requireAdminSession()
  return <AuditList />
}
