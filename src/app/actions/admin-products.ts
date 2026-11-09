"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { productFormSchema, type ProductFormInput } from "@/lib/validations/product.schema"
import { saveAdminProduct } from "@/server/api/endpoints/store"
import { requireAdminSession } from "@/server/api/require-admin-session"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { HttpResponse } from "@/types/http-response.interface"

const productIdSchema = z.string().min(1).optional()

const SAVE_ERROR_TITLE = "Não foi possível salvar o produto"

export async function saveProductAction(input: ProductFormInput, id?: string): Promise<HttpResponse<{ id: string }>> {
  // Sessão válida antes de tudo (o proxy não basta: actions são POSTs e o matcher pode mudar).
  // Sem sessão, redireciona ao login — fora do try/catch para o redirect não ser engolido.
  // O papel é conferido no `saveAdminProduct` (403 → HttpResponse).
  await requireAdminSession()

  const parsedId = productIdSchema.safeParse(id)
  if (!parsedId.success) return invalidInputResponse("Produto inválido")

  const parsed = productFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(SAVE_ERROR_TITLE, parsed.error.issues[0])

  const productId = parsedId.data
  try {
    const product = await saveAdminProduct(parsed.data, productId)
    revalidatePath("/loja", "layout")
    revalidatePath("/admin/loja/produtos")
    return {
      status: productId ? 200 : 201,
      data: { id: product.id },
      title: productId ? "Produto atualizado" : "Produto cadastrado",
    }
  } catch (error) {
    return toErrorResponse(error, {
      title: SAVE_ERROR_TITLE,
      context: "saveProductAction",
      fieldByCode: { [API_ERROR_CODE.PRODUCT_DUPLICATE_SLUG]: "slug" },
    })
  }
}
