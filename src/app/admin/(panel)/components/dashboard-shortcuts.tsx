import { canManageEvents } from "@/lib/utils/admin-permissions"
import { getAdminShortcuts } from "@/lib/utils/admin-dashboard"
import { requireAdminSession } from "@/server/api/require-admin-session"

import { DashboardShortcut } from "./dashboard-shortcut"

/** Atalhos conforme o papel (o operador não vê "Nova corrida"). */
export async function DashboardShortcuts() {
  const admin = await requireAdminSession()
  const shortcuts = getAdminShortcuts(canManageEvents(admin.papel))

  return (
    <nav aria-labelledby="dashboard-shortcuts-title" className="flex flex-col gap-3">
      <h2 id="dashboard-shortcuts-title" className="font-heading text-lg font-extrabold text-brand-navy">
        Atalhos
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((shortcut) => (
          <DashboardShortcut key={shortcut.href} shortcut={shortcut} />
        ))}
      </ul>
    </nav>
  )
}
