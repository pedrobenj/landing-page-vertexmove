import { BarChart3 } from "lucide-react"

/** Números de inscrições: dependem dos relatórios do backend (fase 5 do plano). */
export function DashboardMetrics() {
  return (
    <section
      aria-labelledby="dashboard-metrics-title"
      className="flex items-start gap-3 rounded-2xl border border-dashed bg-card p-4 text-sm text-muted-foreground"
    >
      <BarChart3 className="mt-0.5 size-5 shrink-0 text-brand-navy" aria-hidden="true" />
      <p>
        <span id="dashboard-metrics-title" className="font-heading font-bold text-brand-navy">
          Números
        </span>{" "}
        · Inscrições, confirmadas, valor arrecadado e vagas restantes aparecem aqui quando os relatórios do backend estiverem
        prontos.
      </p>
    </section>
  )
}
