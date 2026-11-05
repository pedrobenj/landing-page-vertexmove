"use client"

import { useEffect } from "react"

import { useCartStore } from "@/stores/cart-store"

/** Carrega o carrinho do localStorage depois da hidratação (evita mismatch SSR/cliente). */
export function CartHydrator() {
  useEffect(() => {
    void useCartStore.persist.rehydrate()
  }, [])
  return null
}
