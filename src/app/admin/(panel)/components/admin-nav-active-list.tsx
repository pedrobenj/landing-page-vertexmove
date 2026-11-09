"use client"

import { usePathname } from "next/navigation"

import { AdminNavList } from "./admin-nav-list"

/** Menu com o item da rota atual destacado. Fica dentro de `<Suspense>` (usePathname em rota dinâmica). */
export function AdminNavActiveList() {
  return <AdminNavList pathname={usePathname()} />
}
