import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { MAX_ITEMS_PER_ORDER, MAX_QUANTITY_PER_ITEM } from "@/lib/utils/constants"
import type { CartIssue, CartItem } from "@/types/cart.interface"

interface CartState {
  items: CartItem[]
  /** Retorna false se o carrinho já tem o máximo de itens diferentes. */
  addItem: (variantId: string, quantity: number) => boolean
  setQuantity: (variantId: string, quantity: number) => void
  removeItem: (variantId: string) => void
  applyIssues: (issues: CartIssue[]) => void
  clear: () => void
}

const clampQuantity = (quantity: number) => Math.max(1, Math.min(quantity, MAX_QUANTITY_PER_ITEM))

/**
 * Carrinho da loja. Guarda só variantId + quantity; preço e estoque vêm sempre do servidor.
 * skipHydration: a leitura do localStorage acontece no CartHydrator, depois da hidratação do React.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (variantId, quantity) => {
        const items = get().items
        const existing = items.find((item) => item.variantId === variantId)
        if (existing) {
          set({
            items: items.map((item) =>
              item.variantId === variantId ? { ...item, quantity: clampQuantity(item.quantity + quantity) } : item,
            ),
          })
          return true
        }
        if (items.length >= MAX_ITEMS_PER_ORDER) return false
        set({ items: [...items, { variantId, quantity: clampQuantity(quantity) }] })
        return true
      },
      setQuantity: (variantId, quantity) =>
        set({
          items: get().items.map((item) =>
            item.variantId === variantId ? { ...item, quantity: clampQuantity(quantity) } : item,
          ),
        }),
      removeItem: (variantId) => set({ items: get().items.filter((item) => item.variantId !== variantId) }),
      applyIssues: (issues) => {
        const byVariant = new Map(issues.map((issue) => [issue.variantId, issue.availableQuantity]))
        set({
          items: get()
            .items.map((item) =>
              byVariant.has(item.variantId) ? { ...item, quantity: byVariant.get(item.variantId) ?? 0 } : item,
            )
            .filter((item) => item.quantity > 0),
        })
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "vertex-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
)

export const selectCartCount = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.quantity, 0)

export const selectItemQuantity = (state: CartState, variantId: string): number =>
  state.items.find((item) => item.variantId === variantId)?.quantity ?? 0
