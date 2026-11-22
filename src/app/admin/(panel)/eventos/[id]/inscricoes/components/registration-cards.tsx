import type { ApiAdminRegistration } from "@/types/api/admin-registration.interface"

import { RegistrationCard } from "./registration-card"

interface RegistrationCardsProps {
  eventId: number
  registrations: ApiAdminRegistration[]
  canManage: boolean
  onChanged: () => void
}

/** Cards do celular (no desktop, a tabela). */
export function RegistrationCards({ eventId, registrations, canManage, onChanged }: RegistrationCardsProps) {
  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {registrations.map((registration) => (
        <RegistrationCard key={registration.id} eventId={eventId} registration={registration} canManage={canManage} onChanged={onChanged} />
      ))}
    </ul>
  )
}
