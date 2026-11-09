import { ADMIN_DASHBOARD_METRICS } from "@/lib/utils/admin-dashboard"

import { DashboardMetricCard } from "./dashboard-metric-card"

export function DashboardMetrics() {
  return (
    <section aria-labelledby="dashboard-metrics-title" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 id="dashboard-metrics-title" className="font-heading text-lg font-extrabold text-brand-navy">
          Números
        </h2>
        <p className="text-sm text-muted-foreground">Aguardando os relatórios de inscrições do backend.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ADMIN_DASHBOARD_METRICS.map((label) => (
          <DashboardMetricCard key={label} label={label} />
        ))}
      </ul>
    </section>
  )
}
