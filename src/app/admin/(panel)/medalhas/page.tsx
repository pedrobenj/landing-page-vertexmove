import type { Metadata } from "next"

export const metadata: Metadata = { title: "Medalhas" }

export default function AdminMedalsPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-extrabold text-brand-navy">Medalhas</h1>
      <p className="text-muted-foreground">Medalhas avulsas de edições anteriores (fase 2).</p>
    </section>
  )
}
