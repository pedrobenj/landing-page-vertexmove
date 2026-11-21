import "server-only"

import { z } from "zod"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { ORDER_STATUS } from "@/enums/order-status.enum"
import { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { PRODUCT_TYPE } from "@/enums/product-type.enum"
import { MOCK_CHECKOUT_PATH } from "@/lib/utils/checkout-url"
import {
  MAX_ITEMS_PER_ORDER,
  MAX_PRODUCT_PRICE_CENTS,
  MAX_QUANTITY_PER_ITEM,
  MAX_VARIANT_LABEL_LENGTH,
  MAX_VARIANT_STOCK,
} from "@/lib/utils/constants"
import { isOrderCode } from "@/lib/utils/is-order-code"
import { isValidCpf } from "@/lib/utils/is-valid-cpf"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { ApiAdminStoreOrder, ApiCreatedStoreOrder } from "@/types/api/store-order.interface"

import { withAdmin } from "../mock-guards"
import { apiError, created, json, type MockContext, type MockRoute, noContent } from "../mock-http"
import { validate } from "../mock-schemas"
import type { MockOrderAction } from "../store/mock-store.repository"
import {
  presentAdminOrder,
  presentAdminOrderDetails,
  presentAdminProduct,
  presentOrderSummary,
  presentPublicProduct,
} from "../store/mock-store-presenters"
import { getMockStore } from "../store/mock-store-state"
import type { MockStoreOrder } from "../store/mock-store-types"
import { isStoreConflictErrorName, STORE_CONFLICT_ERRORS } from "../store/store-errors"

/**
 * Loja no mock, com as rotas, corpos, status e erros do módulo `loja` do backend (fase 10).
 * Referência: `vertex-backend/src/modules/loja/http/` e `plan/10-loja.md` (contrato).
 */

/** Atraso do "webhook" simulado: dá tempo de a página do pedido mostrar "Confirmando seu pagamento…". */
const MOCK_WEBHOOK_DELAY_MS = 4_000
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** `idSeguroSchema` do backend: bigint em string. */
const safeId = z.string().regex(/^[1-9][0-9]{0,15}$/, "deve ser um id numérico")

const cartItemsSchema = z
  .array(z.strictObject({ varianteId: safeId, quantidade: z.number().int().min(1).max(MAX_QUANTITY_PER_ITEM) }))
  .min(1)
  .max(MAX_ITEMS_PER_ORDER)
  .refine((itens) => new Set(itens.map((item) => item.varianteId)).size === itens.length, "não pode haver itens repetidos")

const priceCartSchema = z.strictObject({ itens: cartItemsSchema })

const createOrderSchema = z.strictObject({
  nomeCompleto: z.string().trim().min(3).max(200),
  cpf: z.string().regex(/^\d{11}$/).refine(isValidCpf, "deve ser um CPF válido"),
  whatsapp: z.string().regex(/^\+55\d{10,11}$/, "deve ser um WhatsApp brasileiro válido"),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email("deve ser um e-mail válido")),
  aceitePrivacidade: z.literal(true, "é preciso aceitar a política de privacidade"),
  itens: cartItemsSchema,
})

const saveProductSchema = z.strictObject({
  slug: z.string().regex(SLUG_PATTERN),
  nome: z.string().trim().min(3).max(200),
  descricao: z.string().trim().min(1),
  tipo: z.enum(PRODUCT_TYPE),
  precoCentavos: z.number().int().min(1).max(MAX_PRODUCT_PRICE_CENTS),
  retirada: z.string().trim().min(1),
  ativo: z.boolean(),
  destaque: z.boolean(),
  ordem: z.number().int().min(0).optional(),
  variantes: z
    .array(
      z.strictObject({
        id: safeId.optional(),
        rotulo: z.string().trim().toUpperCase().min(1).max(MAX_VARIANT_LABEL_LENGTH),
        estoque: z.number().int().min(0).max(MAX_VARIANT_STOCK),
        estoqueOriginal: z.number().int().min(0).max(MAX_VARIANT_STOCK).optional(),
      }),
    )
    .min(1)
    .refine((variantes) => new Set(variantes.map((variant) => variant.rotulo)).size === variantes.length, "rótulo repetido"),
})

const mockStorePaymentSchema = z.strictObject({
  resultado: z.enum([PAYMENT_STATUS.APPROVED, PAYMENT_STATUS.PENDING, PAYMENT_STATUS.REJECTED, PAYMENT_STATUS.CANCELLED]),
})

const ORDER_ACTIONS: readonly MockOrderAction[] = ["pronto", "retirado", "cancelar"]

function orderNotFound(): Response {
  return apiError(404, API_ERROR_CODE.NOT_FOUND, "Recurso não encontrado.")
}

function productNotFound(): Response {
  return apiError(404, API_ERROR_CODE.NOT_FOUND, "Recurso não encontrado.")
}

/** Código fora do formato → 404 sem consultar nada (como o backend). */
function findOrder(codigo: string): MockStoreOrder | null {
  return isOrderCode(codigo) ? getMockStore().getOrder(codigo) : null
}

/** O `accessToken` de `POST /loja/pedidos` é a credencial para pagar (decisão L4). */
function authorize(headers: Headers, order: MockStoreOrder): Response | null {
  const [scheme, token] = (headers.get("Authorization") ?? "").split(" ")
  return scheme === "Bearer" && token === order.accessToken ? null : apiError(401, API_ERROR_CODE.NOT_AUTHENTICATED, "Autenticação necessária.")
}

function saveProduct(ctx: MockContext, id?: string): Response {
  const input = validate(saveProductSchema, ctx.body)
  if (input instanceof Response) return input
  try {
    const product = getMockStore().saveProduct(input, id)
    return id ? json(200, presentAdminProduct(product)) : created(presentAdminProduct(product), `/admin/loja/produtos/${product.id}`)
  } catch (error) {
    if (!(error instanceof Error)) throw error
    if (error.name === "ProductNotFoundError") return productNotFound()
    if (isStoreConflictErrorName(error.name)) {
      const { status, codigo } = STORE_CONFLICT_ERRORS[error.name]
      return apiError(status, codigo, error.message)
    }
    throw error
  }
}

function listAdminOrders(query: URLSearchParams): CursorPage<ApiAdminStoreOrder> | Response {
  const rawLimit = query.get("limit")
  const limit = rawLimit === null ? DEFAULT_LIMIT : Number(rawLimit)
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return apiError(422, API_ERROR_CODE.INVALID_DATA, "limit deve ser um inteiro entre 1 e 100.")
  }
  const status = query.get("status")
  if (status && !(Object.values(ORDER_STATUS) as string[]).includes(status)) {
    return apiError(422, API_ERROR_CODE.INVALID_DATA, "status inválido.")
  }
  const orders = getMockStore()
    .listOrders()
    .filter((order) => !status || order.status === status)
  const cursor = query.get("cursor")
  const start = cursor ? orders.findIndex((order) => order.codigo === cursor) + 1 : 0
  if (cursor && start === 0) return apiError(422, API_ERROR_CODE.INVALID_DATA, "Cursor inválido.")
  const page = orders.slice(start, start + limit)
  const hasMore = start + limit < orders.length
  return { items: page.map(presentAdminOrder), nextCursor: hasMore && page.length > 0 ? page[page.length - 1].codigo : null }
}

export const storeRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/loja/produtos",
    handler: () => json(200, getMockStore().listActiveProducts().map(presentPublicProduct)),
  },
  {
    method: "GET",
    path: "/loja/produtos/:slug",
    handler: ({ params }) => {
      const product = SLUG_PATTERN.test(params.slug) ? getMockStore().getActiveProductBySlug(params.slug) : null
      return product ? json(200, presentPublicProduct(product)) : productNotFound()
    },
  },
  {
    method: "POST",
    path: "/loja/carrinho/precificar",
    handler: ({ body }) => {
      const input = validate(priceCartSchema, body)
      if (input instanceof Response) return input
      return json(200, getMockStore().priceItems(input.itens))
    },
  },
  {
    method: "POST",
    path: "/loja/pedidos",
    handler: ({ body }) => {
      const input = validate(createOrderSchema, body)
      if (input instanceof Response) return input
      const result = getMockStore().createOrder(input)
      if (!result.ok) {
        return apiError(409, API_ERROR_CODE.CART_CHANGED, "O carrinho mudou: confira preços e estoque.", { carrinho: result.cart })
      }
      const response: ApiCreatedStoreOrder = {
        codigo: result.order.codigo,
        accessToken: result.order.accessToken,
        expiraEm: result.order.expiraEm,
      }
      return json(201, response)
    },
  },
  {
    method: "GET",
    path: "/loja/pedidos/:codigo",
    handler: ({ params }) => {
      const order = findOrder(params.codigo)
      return order ? json(200, presentOrderSummary(order)) : orderNotFound()
    },
  },
  {
    // Cria a "preferência" do Checkout Pro do pedido. O mock aponta para o checkout falso local.
    method: "POST",
    path: "/loja/pedidos/:codigo/pagamentos",
    handler: ({ params, headers }) => {
      const order = findOrder(params.codigo)
      if (!order) return orderNotFound()
      const denied = authorize(headers, order)
      if (denied) return denied
      if (!headers.get("Idempotency-Key")) return apiError(422, API_ERROR_CODE.INVALID_DATA, "Idempotency-Key obrigatório.")
      if (order.status === ORDER_STATUS.EXPIRED) return apiError(409, API_ERROR_CODE.ORDER_EXPIRED, "O pedido expirou.")
      if (order.status !== ORDER_STATUS.PENDING || order.aprovacaoEm !== null) {
        return apiError(409, API_ERROR_CODE.STATE_CONFLICT, "O pedido não está aguardando pagamento.")
      }
      return json(201, { checkoutUrl: `${MOCK_CHECKOUT_PATH}${order.codigo}` })
    },
  },
  {
    // Só no mock: faz o papel do webhook do Mercado Pago para o pedido.
    method: "POST",
    path: "/dev/loja/pedidos/:codigo/pagamento",
    handler: ({ params, body }) => {
      const input = validate(mockStorePaymentSchema, body)
      if (input instanceof Response) return input
      const order = findOrder(params.codigo)
      if (!order) return orderNotFound()
      if (order.status !== ORDER_STATUS.PENDING) {
        return apiError(409, API_ERROR_CODE.STATE_CONFLICT, "O pedido não está aguardando pagamento.")
      }
      if (input.resultado === PAYMENT_STATUS.APPROVED) getMockStore().scheduleApproval(order.codigo, Date.now() + MOCK_WEBHOOK_DELAY_MS)
      return noContent()
    },
  },
  {
    method: "GET",
    path: "/admin/loja/produtos",
    handler: withAdmin(() => json(200, getMockStore().listAllProducts().map(presentAdminProduct))),
  },
  {
    method: "POST",
    path: "/admin/loja/produtos",
    handler: withAdmin((ctx) => saveProduct(ctx)),
  },
  {
    method: "GET",
    path: "/admin/loja/produtos/:id",
    handler: withAdmin(({ params }) => {
      const product = getMockStore().getProductById(params.id)
      return product ? json(200, presentAdminProduct(product)) : productNotFound()
    }),
  },
  {
    method: "PATCH",
    path: "/admin/loja/produtos/:id",
    handler: withAdmin((ctx) => saveProduct(ctx, ctx.params.id)),
  },
  {
    method: "GET",
    path: "/admin/loja/pedidos",
    handler: withAdmin(({ query }) => {
      const page = listAdminOrders(query)
      return page instanceof Response ? page : json(200, page)
    }),
  },
  {
    method: "GET",
    path: "/admin/loja/pedidos/:codigo",
    handler: withAdmin(({ params }) => {
      const order = findOrder(params.codigo)
      return order ? json(200, presentAdminOrderDetails(order)) : orderNotFound()
    }),
  },
  {
    method: "POST",
    path: "/admin/loja/pedidos/:codigo/:acao",
    handler: withAdmin(({ params }) => {
      const action = ORDER_ACTIONS.find((item) => item === params.acao)
      if (!action) return apiError(404, API_ERROR_CODE.NOT_FOUND, "Rota não existe.")
      if (!findOrder(params.codigo)) return orderNotFound()
      const updated = getMockStore().transitionOrder(params.codigo, action)
      return updated ? noContent() : apiError(409, API_ERROR_CODE.STATE_CONFLICT, "Ação não permitida no status atual do pedido.")
    }),
  },
]
