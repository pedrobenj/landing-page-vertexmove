import { LogOut } from "lucide-react"

import { logoutAdmin } from "@/app/actions/admin-auth"

export function LogoutButton() {
  return (
    <form action={logoutAdmin}>
      <button
        type="submit"
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-brand-green focus-visible:outline-2 focus-visible:outline-brand-green"
      >
        <LogOut className="size-4" aria-hidden="true" />
        Sair
      </button>
    </form>
  )
}
