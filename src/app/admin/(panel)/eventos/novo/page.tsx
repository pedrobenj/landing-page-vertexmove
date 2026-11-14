import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminBackLink, AdminPageBody, AdminPageHero } from "@/components/admin"

import { EventFormSkeleton } from "../components"

import { NewEventForm } from "./components"

export const metadata: Metadata = { title: "Nova corrida" }

export default function NewEventPage() {
  return (
    <>
      <AdminPageHero
        id="new-event-title"
        eyebrow="Corridas"
        title="Nova corrida"
        description="A corrida nasce como rascunho: publique quando estiver pronta."
        before={<AdminBackLink href="/admin/eventos">Suas provas</AdminBackLink>}
      />
      <AdminPageBody>
        <Suspense fallback={<EventFormSkeleton />}>
          <NewEventForm />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
