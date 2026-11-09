import { canManageEvents } from "@/lib/utils/admin-permissions"
import { requireAdminSession } from "@/server/api/require-admin-session"

import { NewEventLink } from "./new-event-link"

/** "Nova corrida" só para quem pode cadastrar (o operador só lê). */
export async function NewEventButton() {
  const admin = await requireAdminSession()
  return canManageEvents(admin.papel) ? <NewEventLink /> : null
}
