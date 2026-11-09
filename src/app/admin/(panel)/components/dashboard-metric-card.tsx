import { Badge } from "@/components/ui/badge"

interface DashboardMetricCardProps {
  label: string
}

/** Métrica ainda sem endpoint no backend (§15). */
export function DashboardMetricCard({ label }: DashboardMetricCardProps) {
  return (
    <li className="flex flex-col gap-2 rounded-2xl border border-dashed bg-card p-4">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <span className="font-heading text-3xl font-black text-muted-foreground/50" aria-hidden="true">
        —
      </span>
      <Badge variant="secondary" className="w-fit">
        Em breve
      </Badge>
    </li>
  )
}
