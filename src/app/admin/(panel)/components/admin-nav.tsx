import { Suspense } from "react"

import { AdminNavActiveList } from "./admin-nav-active-list"
import { AdminNavList } from "./admin-nav-list"

/** Menu do painel. No mobile vira uma faixa com rolagem horizontal abaixo do header. */
export function AdminNav() {
  return (
    <nav aria-label="Menu do admin" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <Suspense fallback={<AdminNavList />}>
        <AdminNavActiveList />
      </Suspense>
    </nav>
  )
}
