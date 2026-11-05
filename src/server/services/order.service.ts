import "server-only"

import { addMinutes } from "date-fns"

import { ORDER_RESERVATION_MINUTES } from "@/lib/utils/constants"
import type { CheckoutData } from "@/lib/validations/checkout.schema"
import type { StoreRepository } from "@/server/repositories/store-repository.interface"
import type { PricedCart } from "@/types/cart.interface"

import { priceCart } from "./cart.service"

export type CreateOrderResult =
  | { ok: true; code: string }
  | { ok: false; reason: "EMPTY_CART" }
  | { ok: false; reason: "CART_CHANGED"; cart: PricedCart }

async function priceCurrentCart(input: CheckoutData, repo: StoreRepository): Promise<PricedCart> {
  const products = await repo.getProductsByVariantIds(input.items.map((item) => item.variantId))
  return priceCart(input.items, products)
}

export async function createOrder(input: CheckoutData, repo: StoreRepository, now = new Date()): Promise<CreateOrderResult> {
  const cart = await priceCurrentCart(input, repo)
  if (cart.issues.length > 0) return { ok: false, reason: "CART_CHANGED", cart }
  if (cart.lines.length === 0) return { ok: false, reason: "EMPTY_CART" }

  const result = await repo.createPendingOrder({
    buyer: { name: input.name, cpf: input.cpf, whatsapp: input.whatsapp, email: input.email },
    amount: cart.total,
    expiresAt: addMinutes(now, ORDER_RESERVATION_MINUTES),
    privacyAcceptedAt: now,
    lines: cart.lines.map(({ variantId, quantity, unitPrice, productName, variantLabel }) => ({
      variantId,
      quantity,
      unitPrice,
      productName,
      variantLabel,
    })),
  })

  if (result.ok) return { ok: true, code: result.code }
  // Outra compra levou o estoque entre a validação e a baixa: devolve o carrinho atualizado.
  return { ok: false, reason: "CART_CHANGED", cart: await priceCurrentCart(input, repo) }
}
