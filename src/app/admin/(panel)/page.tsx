import type { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard" }

// TODO(migracao): Task 19 — atalhos e métricas do dashboard.
export default function AdminDashboardPage() {
  return (
    <section aria-labelledby="dashboard-title" className="flex flex-col gap-2">
      <p className="text-xs font-bold tracking-[0.2em] text-brand-green-text uppercase">Painel</p>
      <h1 id="dashboard-title" className="font-heading text-4xl font-black tracking-tight text-brand-navy-deep">
        Dashboard
      </h1>
      <p className="text-muted-foreground">Gerencie eventos, distâncias, kits, documentos e a loja.</p>
    </section>
  )
}
