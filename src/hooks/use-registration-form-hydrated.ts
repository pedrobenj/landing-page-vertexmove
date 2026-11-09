import { useSyncExternalStore } from "react"

import { hasRegistrationFormHydrated, subscribeRegistrationFormHydration } from "@/stores/registration-form-store"

/** true depois que o rascunho da inscrição foi lido do sessionStorage (ou de imediato, se ele estiver bloqueado). */
export function useRegistrationFormHydrated(): boolean {
  return useSyncExternalStore(subscribeRegistrationFormHydration, hasRegistrationFormHydrated, () => false)
}
