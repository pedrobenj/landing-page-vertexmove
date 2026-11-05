import { useSyncExternalStore } from "react"

import { useCartStore } from "@/stores/cart-store"

/** true depois que o carrinho foi lido do localStorage. */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useCartStore.persist.onFinishHydration(onChange),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  )
}
