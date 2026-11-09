import "server-only"

import { cache } from "react"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { env } from "@/lib/env"
import { canManageStore } from "@/lib/utils/admin-permissions"
import type { CheckoutData } from "@/lib/validations/checkout.schema"
import type { ProductFormData } from "@/lib/validations/product.schema"
import type { CartItem, PricedCart } from "@/types/cart.interface"
import type { CreateStoreOrderResult, OrderSummary } from "@/types/order.interface"
import type { StoreProduct } from "@/types/store-product.interface"

import { ApiError } from "../api-error"
import { requireAdminSession } from "../require-admin-session"

/**
 * Loja — PENDENTE no backend VertexMove (§16 do CLAUDE.md). Este é o único ponto de entrada do front:
 * com `USE_MOCK_API=true` delega ao backend falso em `mocks/store/` (estado em `globalThis`); sem o
 * mock, toda chamada lança `503 LOJA_INDISPONIVEL` e as páginas mostram "A loja estará disponível em breve.".
 * Quando a API expuser a loja, só este arquivo troca para `apiFetch`/`adminFetch`.
 */
async function loadMockStore() {
  if (!env.USE_MOCK_API) throw new ApiError(503, API_ERROR_CODE.STORE_UNAVAILABLE, "Loja em breve")
  // Import dinâmico: o mock fica fora do bundle de produção (como o `mockFetch` do transport).
  return import("../mocks/store/mock-store-api")
}

export async function listStoreProducts(): Promise<StoreProduct[]> {
  return (await loadMockStore()).listActiveProducts()
}

/** Produto ativo por slug (404 se não existir/inativo). Deduplicado por requisição (página + `generateMetadata`). */
export const getStoreProduct = cache(async (slug: string): Promise<StoreProduct> => (await loadMockStore()).getActiveProduct(slug))

/** Precifica o carrinho com preço e estoque atuais do servidor (o navegador só manda variante e quantidade). */
export async function priceCart(items: CartItem[]): Promise<PricedCart> {
  return (await loadMockStore()).priceItems(items)
}

/** Cria o pedido pendente e reserva o estoque. Carrinho alterado volta como `{ ok: false, cart }`. */
export async function createStoreOrder(input: CheckoutData): Promise<CreateStoreOrderResult> {
  return (await loadMockStore()).createPendingOrder(input)
}

/** Resumo público do pedido (sem CPF, telefone ou e-mail); 404 se o código não existir. */
export async function getStoreOrder(code: string): Promise<OrderSummary> {
  return (await loadMockStore()).getOrderSummary(code)
}

// Admin: sessão obrigatória na camada de dados (o proxy é pulado em prefetch). O `requireAdminSession`
// redireciona sem sessão — quem chama deixa o redirect subir (`unstable_rethrow`/`toErrorResponse`).

export async function listAdminProducts(): Promise<StoreProduct[]> {
  await requireAdminSession()
  return (await loadMockStore()).listAllProducts()
}

export async function getAdminProduct(id: string): Promise<StoreProduct> {
  await requireAdminSession()
  return (await loadMockStore()).getProductById(id)
}

/** Cria (sem `id`) ou atualiza um produto. Exige papel que gerencia a loja (matriz a confirmar, §16). */
export async function saveAdminProduct(data: ProductFormData, id?: string): Promise<StoreProduct> {
  const admin = await requireAdminSession()
  if (!canManageStore(admin.papel)) {
    throw new ApiError(403, API_ERROR_CODE.ACCESS_DENIED, "Papel sem permissão para alterar a loja")
  }
  return (await loadMockStore()).saveProduct(data, id)
}
