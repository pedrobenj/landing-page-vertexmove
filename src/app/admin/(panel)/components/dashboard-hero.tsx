import { AdminPageHero } from "@/components/admin"
import { canManageEvents } from "@/lib/utils/admin-permissions"
import { requireAdminSession } from "@/server/api/require-admin-session"

import { NewEventLink } from "../eventos/components/new-event-link"

/** Faixa navy do dashboard com o nome do admin (`GET /admin/me`). */
export async function DashboardHero() {
  const admin = await requireAdminSession()
  return (
    <AdminPageHero
      id="dashboard-title"
      eyebrow="Painel do organizador"
      title={`Bom te ver, ${admin.nome}`}
      description="Daqui você monta cada prova, degrau por degrau."
      actions={canManageEvents(admin.papel) && <NewEventLink />}
    />
  )
}
