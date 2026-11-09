import type { Metadata } from "next"
import { connection } from "next/server"

import { requireAdminSession } from "@/server/api/require-admin-session"

export const metadata: Metadata = { title: "Inscrições" }

/** Bloqueante: confere a sessão antes de renderizar (o proxy é pulado em prefetch). */
export const instant = false

// TODO(migracao): Task 19 — página "Em breve" até o backend expor a lista de inscrições (§15).
export default async function AdminRegistrationsPage() {
  await connection()
  await requireAdminSession()
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-extrabold text-brand-navy">Inscrições</h1>
      <p className="text-muted-foreground">Tabela com filtros server-side, exportação CSV e check-in de retirada de kit.</p>
    </section>
  )
}
