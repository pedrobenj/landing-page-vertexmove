import { useSyncExternalStore } from "react"

function subscribe(): () => void {
  return () => {}
}

/**
 * `false` no HTML do servidor e até o React hidratar; `true` depois. Botões que só funcionam com JS
 * ficam desabilitados até lá: um clique antes da hidratação não teria handler e se perderia.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
