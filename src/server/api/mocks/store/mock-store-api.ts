import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import type { CheckoutData } from "@/lib/validations/checkout.schema"
import type { ProductFormData } from "@/lib/validations/product.schema"
import type { CartItem, PricedCart } from "@/types/cart.interface"
import type { CreateStoreOrderResult, OrderSummary } from "@/types/order.interface"
import type { StoreProduct } from "@/types/store-product.interface"

import { ApiError } from "../../api-error"
import { priceCart } from "./cart.service"
import { createMockStoreRepository } from "./mock-store.repository"
import { createOrder } from "./order.service"
import { isStoreConflictErrorName, STORE_CONFLICT_ERROR_CODES } from "./store-errors"
import { STORE_PRODUCTS_SEED } from "./store-products.seed"
import type { StoreRepository } from "./store-repository.interface"

/**
 * Backend falso da loja: a API VertexMove ainda não tem a loja (§16 do CLAUDE.md). Só é carregado pelo
 * `endpoints/store.ts` com `USE_MOCK_API=true` e responde como a API responderia — dados ou `ApiError`.
 */

declare global {
  // Sobrevive ao HMR do `next dev` (o módulo é recarregado, o globalThis não).
  var __vertexMockStore: StoreRepository | undefined
}

function getRepository(): StoreRepository {
  globalThis.__vertexMockStore ??= createMockStoreRepository(STORE_PRODUCTS_SEED)
  return globalThis.__vertexMockStore
}

/** Volta ao catálogo inicial (usado nos testes). */
export function resetMockStore(): void {
  globalThis.__vertexMockStore = createMockStoreRepository(STORE_PRODUCTS_SEED)
}

function notFound(mensagem: string): ApiError {
  return new ApiError(404, API_ERROR_CODE.NOT_FOUND, mensagem)
}

export async function listActiveProducts(): Promise<StoreProduct[]> {
  return getRepository().listActiveProducts()
}

export async function getActiveProduct(slug: string): Promise<StoreProduct> {
  const product = await getRepository().getActiveProductBySlug(slug)
  if (!product) throw notFound("Produto não encontrado")
  return product
}

export async function priceItems(items: CartItem[]): Promise<PricedCart> {
  const products = await getRepository().getProductsByVariantIds(items.map((item) => item.variantId))
  return priceCart(items, products)
}

export async function createPendingOrder(input: CheckoutData): Promise<CreateStoreOrderResult> {
  const result = await createOrder(input, getRepository())
  if (result.ok) return { ok: true, code: result.code }
  if (result.reason === "EMPTY_CART") throw new ApiError(422, API_ERROR_CODE.EMPTY_CART, "Carrinho vazio")
  return { ok: false, cart: result.cart }
}

export async function getOrderSummary(code: string): Promise<OrderSummary> {
  const order = await getRepository().getOrderSummaryByCode(code)
  if (!order) throw notFound("Pedido não encontrado")
  return order
}

export async function listAllProducts(): Promise<StoreProduct[]> {
  return getRepository().listAllProducts()
}

export async function getProductById(id: string): Promise<StoreProduct> {
  const product = await getRepository().getProductById(id)
  if (!product) throw notFound("Produto não encontrado")
  return product
}

/** Erros do repositório viram o `ApiError` que a API devolveria (404 ou 409 com o código do conflito). */
export async function saveProduct(data: ProductFormData, id?: string): Promise<StoreProduct> {
  try {
    return await getRepository().saveProduct(data, id)
  } catch (error) {
    if (!(error instanceof Error)) throw error
    if (error.name === "ProductNotFoundError") throw notFound(error.message)
    if (isStoreConflictErrorName(error.name)) throw new ApiError(409, STORE_CONFLICT_ERROR_CODES[error.name], error.message)
    throw error
  }
}
