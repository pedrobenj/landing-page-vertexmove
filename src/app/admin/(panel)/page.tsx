import type { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard" }

export default function AdminDashboardPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-extrabold text-brand-navy">Dashboard</h1>
      <p className="text-muted-foreground">Inscritos por evento e modalidade, receita e pagamentos pendentes.</p>
    </section>
  )
}
