import type { Metadata } from "next"
import { Suspense } from "react"

import { DashboardMetrics, DashboardOverview, DashboardOverviewSkeleton } from "./components"

export const metadata: Metadata = { title: "Dashboard" }

export default function AdminDashboardPage() {
  return (
    <section aria-labelledby="dashboard-title" className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold tracking-[0.2em] text-brand-green-text uppercase">Painel</p>
        <h1 id="dashboard-title" className="font-heading text-4xl font-black tracking-tight text-brand-navy-deep">
          Dashboard
        </h1>
      </div>
      <Suspense fallback={<DashboardOverviewSkeleton />}>
        <DashboardOverview />
      </Suspense>
      <DashboardMetrics />
    </section>
  )
}
