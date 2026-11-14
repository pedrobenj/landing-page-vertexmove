import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminPageBody, AdminPageHeroSkeleton } from "@/components/admin"

import {
  DashboardHero,
  DashboardMetrics,
  DashboardShortcuts,
  DashboardShortcutsSkeleton,
  UpcomingEvents,
  UpcomingEventsSkeleton,
} from "./components"

export const metadata: Metadata = { title: "Painel" }

export default function AdminDashboardPage() {
  return (
    <>
      <Suspense fallback={<AdminPageHeroSkeleton />}>
        <DashboardHero />
      </Suspense>
      <AdminPageBody>
        <section aria-labelledby="upcoming-events-title" className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="upcoming-events-title" className="font-heading text-2xl font-black text-brand-navy-deep">
              Próximos topos
            </h2>
            <p className="text-sm text-muted-foreground">O que falta para cada prova receber inscrições.</p>
          </div>
          <Suspense fallback={<UpcomingEventsSkeleton />}>
            <UpcomingEvents />
          </Suspense>
        </section>
        <Suspense fallback={<DashboardShortcutsSkeleton />}>
          <DashboardShortcuts />
        </Suspense>
        <DashboardMetrics />
      </AdminPageBody>
    </>
  )
}
