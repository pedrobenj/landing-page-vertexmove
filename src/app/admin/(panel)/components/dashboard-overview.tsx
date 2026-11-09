import { canManageEvents } from "@/lib/utils/admin-permissions"
import { getAdminShortcuts } from "@/lib/utils/admin-dashboard"
import { getAdminRoleLabel } from "@/lib/utils/status-labels"
import { requireAdminSession } from "@/server/api/require-admin-session"

import { DashboardShortcut } from "./dashboard-shortcut"

/** Saudação com nome e papel (`GET /admin/me`) e atalhos conforme o papel. */
export async function DashboardOverview() {
  const admin = await requireAdminSession()
  const shortcuts = getAdminShortcuts(canManageEvents(admin.papel))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="font-heading text-2xl font-extrabold text-brand-navy">Olá, {admin.nome}!</p>
        <p className="text-sm text-muted-foreground">Perfil: {getAdminRoleLabel(admin.papel)}</p>
      </div>
      <nav aria-label="Atalhos">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((shortcut) => (
            <DashboardShortcut key={shortcut.href} shortcut={shortcut} />
          ))}
        </ul>
      </nav>
    </div>
  )
}
