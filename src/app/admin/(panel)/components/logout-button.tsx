import { LogOut } from "lucide-react"

import { logoutAdmin } from "@/app/actions/admin-auth"

export function LogoutButton() {
  return (
    <form action={logoutAdmin}>
      <button type="submit" className="inline-flex items-center gap-1 hover:text-brand-green">
        <LogOut className="size-4" aria-hidden="true" /> Sair
      </button>
    </form>
  )
}
