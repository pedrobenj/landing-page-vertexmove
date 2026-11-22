import { canCancelRegistration, getKitPickupAction } from "@/lib/utils/admin-registration-actions"
import type { ApiAdminRegistrationDetails } from "@/types/api/admin-registration.interface"

import { KitPickupButton } from "../../components/kit-pickup-button"
import { CancelRegistrationButton } from "./cancel-registration-button"

interface RegistrationActionsProps {
  registration: ApiAdminRegistrationDetails
}

/** Retirada de kit e cancelamento (destrutivo, no corpo: sem contraste sobre o navy). */
export function RegistrationActions({ registration }: RegistrationActionsProps) {
  const pickup = getKitPickupAction(registration)
  const cancellable = canCancelRegistration(registration.status)
  if (!pickup && !cancellable) return null

  return (
    <section aria-labelledby="registration-actions-title" className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
      <h2 id="registration-actions-title" className="font-heading font-black text-brand-navy-deep">Ações</h2>
      <div className="flex flex-col gap-2 sm:flex-row">
        <KitPickupButton eventId={registration.evento.id} registration={registration} className="w-full sm:w-auto" />
        {cancellable && <CancelRegistrationButton registration={registration} />}
      </div>
    </section>
  )
}
