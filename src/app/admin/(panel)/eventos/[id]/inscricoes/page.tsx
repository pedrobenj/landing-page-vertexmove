import type { Metadata } from "next"

export const metadata: Metadata = { title: "Inscrições" }

export default function AdminRegistrationsPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-extrabold text-brand-navy">Inscrições</h1>
      <p className="text-muted-foreground">Tabela com filtros server-side, exportação CSV e check-in de retirada de kit.</p>
    </section>
  )
}
