"use server"

import { revalidatePath } from "next/cache"

import { cartItemsSchema } from "@/lib/validations/cart.schema"
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout.schema"
import { getStoreRepository } from "@/server/repositories/store.repository"
import { priceCart } from "@/server/services/cart.service"
import { createOrder } from "@/server/services/order.service"
import type { CartIssue, CartItem, PricedCart } from "@/types/cart.interface"
import type { HttpResponse } from "@/types/http-response.interface"

export async function validateCartAction(items: CartItem[]): Promise<HttpResponse<PricedCart>> {
  const parsed = cartItemsSchema.safeParse(items)
  if (!parsed.success) {
    return { status: 400, error: "INVALID_CART", title: parsed.error.issues[0]?.message ?? "Carrinho inválido" }
  }

  try {
    const repo = getStoreRepository()
    const products = await repo.getProductsByVariantIds(parsed.data.map((item) => item.variantId))
    return { status: 200, data: priceCart(parsed.data, products) }
  } catch (error) {
    console.error("[validateCartAction]", error)
    return { status: 500, error: "INTERNAL", title: "Não foi possível carregar o carrinho" }
  }
}

export interface CheckoutResponseData {
  code?: string
  issues?: CartIssue[]
}

export async function createOrderAction(input: CheckoutInput): Promise<HttpResponse<CheckoutResponseData>> {
  // TODO(migracao): Task 20 — o rate limit em memória do Next saiu; a loja vira backend falso e o limite fica com ele.

  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) {
    return { status: 400, error: "INVALID_INPUT", title: parsed.error.issues[0]?.message ?? "Verifique seus dados" }
  }

  try {
    const result = await createOrder(parsed.data, getStoreRepository())

    if (result.ok) {
      // Estoque mudou: catálogo, páginas de produto e destaques da home.
      revalidatePath("/loja", "layout")
      revalidatePath("/")
      return { status: 201, data: { code: result.code }, title: "Pedido criado!" }
    }
    if (result.reason === "EMPTY_CART") {
      return { status: 400, error: "EMPTY_CART", title: "Seu carrinho está vazio" }
    }
    return {
      status: 409,
      error: "CART_CHANGED",
      title: result.cart.issues[0]?.message ?? "Seu carrinho mudou. Confira os itens.",
      data: { issues: result.cart.issues },
    }
  } catch (error) {
    console.error("[createOrderAction]", error)
    return { status: 500, error: "INTERNAL", title: "Não foi possível criar o pedido. Tente novamente." }
  }
}
