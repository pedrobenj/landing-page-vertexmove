/** O item do menu está ativo na rota atual? Vale também para as subrotas (`/admin/eventos/1`). */
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}
