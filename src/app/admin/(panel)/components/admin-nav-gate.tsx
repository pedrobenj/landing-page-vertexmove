import { KeyRound } from "lucide-react"

import { getAdminSessionAllowingPasswordChange } from "@/server/api/require-admin-session"

import { AdminNav } from "./admin-nav"

/**
 * Menu do painel, escondido enquanto a conta usa a senha temporária: só "Minha conta" funciona (o backend
 * responde 403 nas demais rotas e `requireAdminSession` manda de volta para a troca).
 */
export async function AdminNavGate() {
  const admin = await getAdminSessionAllowingPasswordChange()
  if (!admin.trocarSenha) return <AdminNav />
  return (
    <p role="status" className="flex items-center gap-2 text-sm font-semibold text-brand-green">
      <KeyRound aria-hidden="true" className="size-4" />
      Troque a senha temporária para liberar o painel.
    </p>
  )
}
