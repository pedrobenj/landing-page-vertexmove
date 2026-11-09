import { ADMIN_PANEL_NAV_ITEMS, isNavItemActive } from "@/lib/utils"

import { AdminNavLink } from "./admin-nav-link"

interface AdminNavListProps {
  /** Rota atual; sem ela (fallback do Suspense), nenhum item fica ativo. */
  pathname?: string
}

export function AdminNavList({ pathname }: AdminNavListProps) {
  return (
    <ul className="flex items-center gap-1">
      {ADMIN_PANEL_NAV_ITEMS.map((item) => (
        <AdminNavLink key={item.href} item={item} isActive={pathname ? isNavItemActive(pathname, item.href) : false} />
      ))}
    </ul>
  )
}
