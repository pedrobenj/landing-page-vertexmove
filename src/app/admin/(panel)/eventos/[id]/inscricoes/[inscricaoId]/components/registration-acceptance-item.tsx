import { formatDateTimeSafe } from "@/lib/utils/format-date"
import type { ApiAdminRegistrationAcceptance } from "@/types/api/admin-registration.interface"

interface RegistrationAcceptanceItemProps {
  acceptance: ApiAdminRegistrationAcceptance
}

export function RegistrationAcceptanceItem({ acceptance }: RegistrationAcceptanceItemProps) {
  return (
    <li className="flex flex-col gap-0.5 py-2 text-sm sm:flex-row sm:justify-between sm:gap-4">
      <span>
        {acceptance.documentoTitulo} <span className="text-muted-foreground">v{acceptance.documentoVersao}</span>
      </span>
      <span className="text-muted-foreground tabular-nums">{formatDateTimeSafe(acceptance.aceitoEm)}</span>
    </li>
  )
}
