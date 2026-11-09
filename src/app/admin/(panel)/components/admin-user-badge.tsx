import { getAdminRoleLabel, getInitials } from "@/lib/utils"
import { requireAdminSession } from "@/server/api/require-admin-session"

/** Nome e papel do admin logado (`GET /admin/me`). Sem sessão válida, redireciona ao login. */
export async function AdminUserBadge() {
  const admin = await requireAdminSession()

  return (
    <div className="flex items-center gap-2.5" data-testid="admin-user-badge">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-green font-heading text-sm font-black text-brand-navy-deep"
      >
        {getInitials(admin.nome)}
      </span>
      <span className="hidden flex-col leading-tight sm:flex">
        <span className="text-sm font-bold text-white">{admin.nome}</span>
        <span className="text-xs text-white/70">{getAdminRoleLabel(admin.papel)}</span>
      </span>
      <span className="sr-only sm:hidden">{admin.nome}</span>
    </div>
  )
}
