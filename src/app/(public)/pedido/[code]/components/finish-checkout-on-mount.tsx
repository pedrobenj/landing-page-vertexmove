"use client"

import { useEffect } from "react"
import { toast } from "sonner"

import { consumeLastOrder } from "@/lib/utils"
import { useCartStore } from "@/stores/cart-store"

interface FinishCheckoutOnMountProps {
  code: string
}

const ORDER_CREATED_TOAST_ID = "order-created"

/**
 * Fecha o checkout só quando a página do pedido é aberta logo após a compra (marca no sessionStorage):
 * esvazia o carrinho e mostra o "Pedido criado!".
 *
 * As duas coisas ficam aqui, e não no checkout: limpar antes evitaria o flash de "carrinho vazio"
 * durante a navegação, e o toast disparado antes do `router.push` gastava seus 4 s enquanto a página
 * do pedido (bloqueante) carregava — com a rede ou o servidor lentos, sumia antes de o comprador vê-la.
 */
export function FinishCheckoutOnMount({ code }: FinishCheckoutOnMountProps) {
  useEffect(() => {
    if (!consumeLastOrder(code)) return
    useCartStore.getState().clear()
    toast.success("Pedido criado!", { id: ORDER_CREATED_TOAST_ID, description: "Guarde o código do pedido para a retirada." })
  }, [code])

  return null
}
