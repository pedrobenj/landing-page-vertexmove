import type { Metadata } from "next"

export const metadata: Metadata = { title: "Eventos" }

export default function AdminEventsPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-extrabold text-brand-navy">Eventos</h1>
      <p className="text-muted-foreground">CRUD de eventos, modalidades, lotes, kits e cupons.</p>
    </section>
  )
}
