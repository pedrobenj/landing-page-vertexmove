import { canManageEvents } from "@/lib/utils/admin-permissions"
import { requireAdminSession } from "@/server/api/require-admin-session"

import { EventsList } from "./events-list"

/** Confere a sessão (o proxy é pulado em prefetch) antes de montar a lista client. */
export async function AdminEventsList() {
  const admin = await requireAdminSession()
  return <EventsList canManage={canManageEvents(admin.papel)} />
}
