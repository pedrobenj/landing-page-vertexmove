import { z } from "zod"

import { MAX_ITEMS_PER_ORDER, MAX_QUANTITY_PER_ITEM } from "@/lib/utils/constants"

export const cartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z
    .number()
    .int()
    .min(1, "Quantidade mínima é 1")
    .max(MAX_QUANTITY_PER_ITEM, `Máximo de ${MAX_QUANTITY_PER_ITEM} unidades por item`),
})

export const cartItemsSchema = z
  .array(cartItemSchema)
  .min(1, "Seu carrinho está vazio")
  .max(MAX_ITEMS_PER_ORDER, `Máximo de ${MAX_ITEMS_PER_ORDER} itens por pedido`)
  .refine(
    (items) => new Set(items.map((item) => item.variantId)).size === items.length,
    "Há itens repetidos no carrinho",
  )
