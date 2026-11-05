"use server"

import { revalidatePath } from "next/cache"

import { productFormSchema, type ProductFormInput } from "@/lib/validations/product.schema"
import { getAdminSession } from "@/server/auth/require-admin"
import { getStoreRepository } from "@/server/repositories/store.repository"
import type { HttpResponse } from "@/types/http-response.interface"

/**
 * Erros de conflito do repositório (src/server/errors.ts) → código da resposta 409.
 * Compara pelo `name` (fixado em cada classe) e não com `instanceof`: o repositório mock vive em
 * `globalThis` e sobrevive ao HMR guardando as classes de erro antigas.
 */
const CONFLICT_ERROR_CODES: Record<string, string> = {
  DuplicateSlugError: "DUPLICATE_SLUG",
  DuplicateVariantLabelError: "DUPLICATE_VARIANT_LABEL",
  StockChangedError: "STOCK_CHANGED",
  VariantNotOwnedError: "VARIANT_NOT_OWNED",
}

export async function saveProductAction(input: ProductFormInput, id?: string): Promise<HttpResponse<{ id: string }>> {
  if (!(await getAdminSession())) return { status: 401, error: "UNAUTHORIZED", title: "Sessão expirada. Entre novamente." }

  const parsed = productFormSchema.safeParse(input)
  if (!parsed.success) {
    return { status: 400, error: "INVALID_INPUT", title: parsed.error.issues[0]?.message ?? "Verifique os campos" }
  }

  try {
    const product = await getStoreRepository().saveProduct(parsed.data, id)
    revalidatePath("/loja")
    revalidatePath(`/loja/${product.slug}`)
    revalidatePath("/admin/loja/produtos")
    revalidatePath("/")
    return { status: id ? 200 : 201, data: { id: product.id }, title: id ? "Produto atualizado" : "Produto cadastrado" }
  } catch (error) {
    if (error instanceof Error && Object.hasOwn(CONFLICT_ERROR_CODES, error.name)) {
      return { status: 409, error: CONFLICT_ERROR_CODES[error.name], title: error.message }
    }
    console.error("[saveProductAction]", error)
    return { status: 500, error: "INTERNAL", title: "Não foi possível salvar o produto" }
  }
}
