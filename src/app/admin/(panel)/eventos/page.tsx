import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminPageBody, AdminPageHero } from "@/components/admin"

import { AdminEventsList, EventsListSkeleton, NewEventButton } from "./components"

export const metadata: Metadata = { title: "Corridas" }

export default function AdminEventsPage() {
  return (
    <>
      <AdminPageHero
        id="admin-events-title"
        eyebrow="Corridas"
        title="Suas provas"
        description="Rascunhos, publicadas e encerradas. Cada uma com distâncias, kits e documentos."
        actions={
          <Suspense fallback={null}>
            <NewEventButton />
          </Suspense>
        }
      />
      <AdminPageBody>
        <Suspense fallback={<EventsListSkeleton />}>
          <AdminEventsList />
        </Suspense>
      </AdminPageBody>
    </>
  )
}
