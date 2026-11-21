import "server-only"

import { cache } from "react"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { CART_ISSUE_REASON } from "@/enums/cart-issue-reason.enum"
import { env } from "@/lib/env"
import { canManageStore } from "@/lib/utils/admin-permissions"
import {
  toApiCartItems,
  toApiCreateStoreOrder,
  toApiSaveStoreProduct,
  toOrderSummary,
  toPricedCart,
  toStoreProduct,
} from "@/lib/utils/store-api-mappers"
import type { CheckoutData } from "@/lib/validations/checkout.schema"
import type { ProductFormData } from "@/lib/validations/product.schema"
import type { ApiPricedCart } from "@/types/api/store-cart.interface"
import type { ApiCreatedStoreOrder, ApiStoreOrderSummary } from "@/types/api/store-order.interface"
import type { ApiAdminStoreProduct, ApiStoreProduct } from "@/types/api/store-product.interface"
import type { CartItem, PricedCart } from "@/types/cart.interface"
import type { CreateStoreOrderResult, OrderSummary } from "@/types/order.interface"
import type { StoreProduct } from "@/types/store-product.interface"

import { adminFetch } from "../admin-fetch"
import { apiFetch } from "../api-client"
import { ApiError, isApiError } from "../api-error"
import { requireAdminSession } from "../require-admin-session"

/*
 * Loja — módulo `loja` do backend (fase 10, `plan/10-loja.md`). Único ponto do front que fala com a
 * loja: com `USE_MOCK_API=true` as mesmas chamadas caem no mock (`mocks/routes/store-routes.ts`).
 * Os tipos da API (português) são traduzidos para os da UI em `store-api-mappers.ts`.
 * Sem cache: preço e estoque mudam a cada pedido.
 */

/**
 * A loja está ligada? `STORE_ENABLED=false` desliga até o lançamento: as páginas mostram "Loja em breve"
 * sem depender de uma chamada (ex.: carrinho vazio) e o sitemap não lista /loja.
 */
export function isStoreEnabled(): boolean {
  return env.STORE_ENABLED
}

function ensureStoreEnabled(): void {
  if (!isStoreEnabled()) throw new ApiError(503, API_ERROR_CODE.STORE_UNAVAILABLE, "Loja em breve")
}

/** Ids da loja são bigint em string (`idSeguroSchema` do backend). */
const STORE_ID_PATTERN = /^[1-9][0-9]{0,15}$/

export async function listStoreProducts(): Promise<StoreProduct[]> {
  ensureStoreEnabled()
  return (await apiFetch<ApiStoreProduct[]>("/loja/produtos")).map(toStoreProduct)
}

/** Produto ativo por slug (404 se não existir/inativo). Deduplicado por requisição (página + `generateMetadata`). */
export const getStoreProduct = cache(async (slug: string): Promise<StoreProduct> => {
  ensureStoreEnabled()
  return toStoreProduct(await apiFetch<ApiStoreProduct>(`/loja/produtos/${encodeURIComponent(slug)}`))
})

/**
 * `POST /loja/carrinho/precificar`: preço e estoque atuais (o navegador só manda variante e quantidade).
 * Ids fora do formato (carrinho antigo no localStorage) não vão à API, que recusaria o carrinho inteiro
 * com 422: voltam como `indisponivel` e saem do carrinho.
 */
export async function priceCart(items: CartItem[]): Promise<PricedCart> {
  ensureStoreEnabled()
  const valid = items.filter((item) => STORE_ID_PATTERN.test(item.variantId))
  const invalid = items.filter((item) => !STORE_ID_PATTERN.test(item.variantId))
  const priced: ApiPricedCart =
    valid.length > 0
      ? await apiFetch<ApiPricedCart>("/loja/carrinho/precificar", { method: "POST", body: { itens: toApiCartItems(valid) } })
      : { linhas: [], avisos: [], totalCentavos: 0, quantidadeItens: 0 }
  return toPricedCart({
    ...priced,
    avisos: [
      ...priced.avisos,
      ...invalid.map((item) => ({ varianteId: item.variantId, motivo: CART_ISSUE_REASON.UNAVAILABLE, quantidadeDisponivel: 0 })),
    ],
  })
}

function isPricedCart(value: unknown): value is ApiPricedCart {
  return typeof value === "object" && value !== null && Array.isArray((value as ApiPricedCart).linhas) && Array.isArray((value as ApiPricedCart).avisos)
}

/**
 * `POST /loja/pedidos`: cria o pedido pendente e reserva o estoque. O `accessToken` volta só para o
 * servidor (a action o guarda em cookie HttpOnly). `409 CARRINHO_ALTERADO` vira `{ ok: false, cart }`
 * com o carrinho recalculado de `error.dados.carrinho`.
 */
export async function createStoreOrder(input: CheckoutData): Promise<CreateStoreOrderResult> {
  ensureStoreEnabled()
  try {
    const created = await apiFetch<ApiCreatedStoreOrder>("/loja/pedidos", { method: "POST", body: toApiCreateStoreOrder(input) })
    return { ok: true, code: created.codigo, accessToken: created.accessToken, expiresAt: created.expiraEm }
  } catch (error) {
    const cart = isApiError(error) && error.codigo === API_ERROR_CODE.CART_CHANGED ? error.dados?.carrinho : undefined
    if (isPricedCart(cart)) return { ok: false, cart: toPricedCart(cart) }
    throw error
  }
}

/** `GET /loja/pedidos/:codigo`: resumo público (sem CPF, telefone ou e-mail); 404 se não existir. */
export async function getStoreOrder(code: string): Promise<OrderSummary> {
  ensureStoreEnabled()
  return toOrderSummary(await apiFetch<ApiStoreOrderSummary>(`/loja/pedidos/${encodeURIComponent(code)}`))
}

// Admin: sessão obrigatória na camada de dados (o proxy é pulado em prefetch). O `requireAdminSession`
// redireciona sem sessão — quem chama deixa o redirect subir (`unstable_rethrow`/`toErrorResponse`).

export async function listAdminProducts(): Promise<StoreProduct[]> {
  await requireAdminSession()
  ensureStoreEnabled()
  return (await adminFetch<ApiAdminStoreProduct[]>("/admin/loja/produtos")).map(toStoreProduct)
}

export async function getAdminProduct(id: string): Promise<StoreProduct> {
  await requireAdminSession()
  ensureStoreEnabled()
  return toStoreProduct(await adminFetch<ApiAdminStoreProduct>(`/admin/loja/produtos/${encodeURIComponent(id)}`))
}

/** Cria (`POST`, sem `id`) ou atualiza (`PATCH`) um produto. Exige papel que gerencia a loja. */
export async function saveAdminProduct(data: ProductFormData, id?: string): Promise<StoreProduct> {
  const admin = await requireAdminSession()
  if (!canManageStore(admin.papel)) {
    throw new ApiError(403, API_ERROR_CODE.ACCESS_DENIED, "Papel sem permissão para alterar a loja")
  }
  ensureStoreEnabled()
  const body = toApiSaveStoreProduct(data)
  const saved = id
    ? await adminFetch<ApiAdminStoreProduct>(`/admin/loja/produtos/${encodeURIComponent(id)}`, { method: "PATCH", body })
    : await adminFetch<ApiAdminStoreProduct>("/admin/loja/produtos", { method: "POST", body })
  return toStoreProduct(saved)
}
