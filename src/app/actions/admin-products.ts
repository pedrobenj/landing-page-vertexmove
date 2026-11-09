"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { productFormSchema, type ProductFormInput } from "@/lib/validations/product.schema"
import { requireAdminSession } from "@/server/api/require-admin-session"
import { isStoreConflictErrorName, type StoreConflictErrorName } from "@/server/errors"
import { getStoreRepository } from "@/server/repositories/store.repository"
import type { HttpResponse } from "@/types/http-response.interface"

const productIdSchema = z.string().min(1).optional()

/**
 * Erros do repositório (src/server/errors.ts) → código da resposta.
 * Compara pelo `name` (fixado em cada classe) e não com `instanceof`: o repositório mock vive em
 * `globalThis` e sobrevive ao HMR guardando as classes de erro antigas.
 */
const CONFLICT_ERROR_CODES: Record<StoreConflictErrorName, string> = {
  DuplicateSlugError: "DUPLICATE_SLUG",
  DuplicateVariantLabelError: "DUPLICATE_VARIANT_LABEL",
  StockChangedError: "STOCK_CHANGED",
  VariantNotOwnedError: "VARIANT_NOT_OWNED",
}

export async function saveProductAction(input: ProductFormInput, id?: string): Promise<HttpResponse<{ id: string }>> {
  // Sessão válida antes de tudo (o proxy não basta: actions são POSTs e o matcher pode mudar).
  // Sem sessão, redireciona ao login — fora do try/catch para o redirect não ser engolido.
  await requireAdminSession()

  const parsedId = productIdSchema.safeParse(id)
  if (!parsedId.success) return { status: 400, error: "INVALID_INPUT", title: "Produto inválido" }

  const parsed = productFormSchema.safeParse(input)
  if (!parsed.success) {
    return { status: 400, error: "INVALID_INPUT", title: parsed.error.issues[0]?.message ?? "Verifique os campos" }
  }

  const productId = parsedId.data
  try {
    const product = await getStoreRepository().saveProduct(parsed.data, productId)
    revalidatePath("/loja")
    revalidatePath(`/loja/${product.slug}`)
    revalidatePath("/admin/loja/produtos")
    revalidatePath("/")
    return {
      status: productId ? 200 : 201,
      data: { id: product.id },
      title: productId ? "Produto atualizado" : "Produto cadastrado",
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ProductNotFoundError") {
      return { status: 404, error: "NOT_FOUND", title: error.message }
    }
    if (error instanceof Error && isStoreConflictErrorName(error.name)) {
      return { status: 409, error: CONFLICT_ERROR_CODES[error.name], title: error.message }
    }
    console.error("[saveProductAction]", error)
    return { status: 500, error: "INTERNAL", title: "Não foi possível salvar o produto" }
  }
}
