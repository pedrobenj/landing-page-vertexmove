"use client"

import { useEffect } from "react"

import { consumeLastOrder } from "@/lib/utils"
import { useCartStore } from "@/stores/cart-store"

interface ClearCartOnMountProps {
  code: string
}

/**
 * Esvazia o carrinho só quando a página do pedido é aberta logo após o checkout (marca no sessionStorage).
 * Limpar aqui, e não no checkout, evita o flash de "carrinho vazio" antes da navegação.
 */
export function ClearCartOnMount({ code }: ClearCartOnMountProps) {
  useEffect(() => {
    if (consumeLastOrder(code)) useCartStore.getState().clear()
  }, [code])

  return null
}
