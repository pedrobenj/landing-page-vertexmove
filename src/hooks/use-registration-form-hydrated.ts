import { useSyncExternalStore } from "react"

import { useRegistrationFormStore } from "@/stores/registration-form-store"

/** true depois que o rascunho da inscrição foi lido do sessionStorage. */
export function useRegistrationFormHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useRegistrationFormStore.persist.onFinishHydration(onChange),
    () => useRegistrationFormStore.persist.hasHydrated(),
    () => false,
  )
}
