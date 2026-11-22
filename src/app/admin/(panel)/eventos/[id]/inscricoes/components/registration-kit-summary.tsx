import { formatDateTimeSafe } from "@/lib/utils/format-date"
import type { ApiAdminRegistration } from "@/types/api/admin-registration.interface"

interface RegistrationKitSummaryProps {
  registration: Pick<ApiAdminRegistration, "kit" | "tamanhoCamisa" | "kitRetiradoEm">
}

/** Kit, tamanho e a retirada (quando houver). */
export function RegistrationKitSummary({ registration }: RegistrationKitSummaryProps) {
  const kit = registration.kit ? [registration.kit.nome, registration.tamanhoCamisa].filter(Boolean).join(" · ") : "Sem kit"
  return (
    <div className="flex flex-col gap-0.5">
      <span>{kit}</span>
      {registration.kitRetiradoEm && (
        <span className="text-xs font-semibold text-brand-green-text">Retirado em {formatDateTimeSafe(registration.kitRetiradoEm)}</span>
      )}
    </div>
  )
}
