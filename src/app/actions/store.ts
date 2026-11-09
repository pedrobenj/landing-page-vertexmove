"use server"

import { revalidatePath } from "next/cache"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { getApiErrorMessage } from "@/lib/utils/api-errors"
import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { cartItemsSchema } from "@/lib/validations/cart.schema"
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout.schema"
import { createStoreOrder, priceCart } from "@/server/api/endpoints/store"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { CartIssue, CartItem, PricedCart } from "@/types/cart.interface"
import type { HttpResponse } from "@/types/http-response.interface"

export async function validateCartAction(items: CartItem[]): Promise<HttpResponse<PricedCart>> {
  const parsed = cartItemsSchema.safeParse(items)
  if (!parsed.success) return invalidInputResponse("Carrinho inválido", parsed.error.issues[0])

  try {
    return { status: 200, data: await priceCart(parsed.data) }
  } catch (error) {
    return toErrorResponse(error, { title: "Não foi possível carregar o carrinho", context: "validateCartAction" })
  }
}

export interface CheckoutResponseData {
  code?: string
  issues?: CartIssue[]
}

/** Cria o pedido pendente. O rate limit fica com o backend da loja (hoje, o mock não limita). */
export async function createOrderAction(input: CheckoutInput): Promise<HttpResponse<CheckoutResponseData>> {
  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse("Verifique seus dados", parsed.error.issues[0])

  try {
    const result = await createStoreOrder(parsed.data)

    if (result.ok) {
      // Estoque mudou: catálogo e páginas de produto.
      revalidatePath("/loja", "layout")
      return { status: 201, data: { code: result.code }, title: "Pedido criado!" }
    }
    return {
      status: 409,
      code: API_ERROR_CODE.CART_CHANGED,
      error: result.cart.issues[0]?.message ?? getApiErrorMessage(API_ERROR_CODE.CART_CHANGED),
      title: "Seu carrinho mudou",
      data: { issues: result.cart.issues },
    }
  } catch (error) {
    return toErrorResponse(error, { title: "Não foi possível finalizar a compra", context: "createOrderAction" })
  }
}
