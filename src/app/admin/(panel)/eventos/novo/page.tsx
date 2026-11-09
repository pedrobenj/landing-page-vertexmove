import type { Metadata } from "next"
import { Suspense } from "react"

import { EventFormSkeleton } from "../components"

import { NewEventForm } from "./components"

export const metadata: Metadata = { title: "Nova corrida" }

export default function NewEventPage() {
  return (
    <section aria-labelledby="new-event-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 id="new-event-title" className="text-2xl font-extrabold text-brand-navy">
          Nova corrida
        </h1>
        <p className="text-muted-foreground">A corrida nasce como rascunho: publique quando estiver pronta.</p>
      </div>
      <Suspense fallback={<EventFormSkeleton />}>
        <NewEventForm />
      </Suspense>
    </section>
  )
}
