import { randomUUID } from "node:crypto"

import { ORDER_STATUS } from "@/enums/order-status.enum"
import { ORDER_RESERVATION_MINUTES } from "@/lib/utils/constants"
import { generateOrderCode } from "@/lib/utils/generate-code"
import type { ApiCartItem, ApiPricedCart } from "@/types/api/store-cart.interface"
import type { ApiCreateStoreOrder } from "@/types/api/store-order.interface"
import type { ApiSaveStoreProduct } from "@/types/api/store-product.interface"

import { priceCart } from "./cart.service"
import type { MockStoreOrder, MockStoreProduct, MockStoreVariant } from "./mock-store-types"
import {
  DuplicateSlugError,
  ProductNotFoundError,
  StockChangedError,
  VariantNotOwnedError,
} from "./store-errors"

export type CreateMockOrderResult = { ok: true; order: MockStoreOrder } | { ok: false; cart: ApiPricedCart }

/** Ação do admin sobre o pedido (`POST /admin/loja/pedidos/:codigo/<acao>`). */
export type MockOrderAction = "pronto" | "retirado" | "cancelar"

/** Transições permitidas (tarefa 10 do plano). Cancelar pago vira `reembolsado` (o estorno do mock é imediato). */
const TRANSITIONS: Record<MockOrderAction, Partial<Record<ORDER_STATUS, ORDER_STATUS>>> = {
  pronto: { [ORDER_STATUS.PAID]: ORDER_STATUS.READY_FOR_PICKUP },
  retirado: { [ORDER_STATUS.READY_FOR_PICKUP]: ORDER_STATUS.PICKED_UP },
  cancelar: {
    [ORDER_STATUS.PENDING]: ORDER_STATUS.CANCELLED,
    [ORDER_STATUS.PAID]: ORDER_STATUS.REFUNDED,
    [ORDER_STATUS.READY_FOR_PICKUP]: ORDER_STATUS.REFUNDED,
  },
}

export interface MockStoreRepository {
  listActiveProducts(): MockStoreProduct[]
  getActiveProductBySlug(slug: string): MockStoreProduct | null
  listAllProducts(): MockStoreProduct[]
  getProductById(id: string): MockStoreProduct | null
  priceItems(items: ApiCartItem[]): ApiPricedCart
  /** Reprecifica e, sem avisos, baixa o estoque e cria o pedido pendente (tudo ou nada). */
  createOrder(input: ApiCreateStoreOrder, now?: Date): CreateMockOrderResult
  /** Pedido por código. Pendente vencido expira aqui e devolve o estoque (o worker do backend faz isso). */
  getOrder(codigo: string, now?: Date): MockStoreOrder | null
  /** Pedidos do mais recente para o mais antigo. */
  listOrders(now?: Date): MockStoreOrder[]
  /** Aplica a ação do admin; `null` se a transição não é permitida no status atual. */
  transitionOrder(codigo: string, action: MockOrderAction, now?: Date): MockStoreOrder | null
  /** Pagamento aprovado no checkout falso: o "webhook" marca o pedido como pago a partir de `at` (ms). */
  scheduleApproval(codigo: string, at: number): void
  /**
   * Cria (sem id) ou atualiza. Variante salva manda `estoqueOriginal` e o estoque muda só pela diferença;
   * variante salva que não veio fica inativa e variante nova com o rótulo de uma inativa a reativa.
   * Lança DuplicateSlugError, VariantNotOwnedError, StockChangedError ou ProductNotFoundError.
   */
  saveProduct(data: ApiSaveStoreProduct, id?: string): MockStoreProduct
}

function byOrderThenName(a: MockStoreProduct, b: MockStoreProduct): number {
  return a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR")
}

function nextNumericId(ids: string[]): string {
  return String(Math.max(0, ...ids.map(Number).filter(Number.isFinite)) + 1)
}

/** Repositório em memória da loja (formato da API). Estado some ao reiniciar o servidor. */
export function createMockStoreRepository(seed: MockStoreProduct[]): MockStoreRepository {
  const products: MockStoreProduct[] = structuredClone(seed)
  const orders = new Map<string, MockStoreOrder>()
  const clone = <T>(value: T): T => structuredClone(value)

  const findVariant = (varianteId: string): MockStoreVariant | undefined => {
    for (const product of products) {
      const variant = product.variantes.find((item) => item.id === varianteId)
      if (variant) return variant
    }
    return undefined
  }

  const restock = (order: MockStoreOrder) => {
    for (const item of order.itens) {
      const variant = findVariant(item.varianteId)
      if (variant) variant.estoque += item.quantidade
    }
  }

  const settle = (order: MockStoreOrder, now: Date) => {
    if (order.aprovacaoEm !== null && now.getTime() >= order.aprovacaoEm) {
      order.aprovacaoEm = null
      if (order.status === ORDER_STATUS.PENDING) {
        order.status = ORDER_STATUS.PAID
        order.pagoEm = now.toISOString()
      }
    }
    if (order.status === ORDER_STATUS.PENDING && order.aprovacaoEm === null && Date.parse(order.expiraEm) <= now.getTime()) {
      order.status = ORDER_STATUS.EXPIRED
      restock(order)
    }
  }

  return {
    listActiveProducts: () => clone(products.filter((product) => product.ativo).sort(byOrderThenName)),

    getActiveProductBySlug(slug) {
      const product = products.find((item) => item.slug === slug && item.ativo)
      return product ? clone(product) : null
    },

    listAllProducts: () => clone([...products].sort(byOrderThenName)),

    getProductById(id) {
      const product = products.find((item) => item.id === id)
      return product ? clone(product) : null
    },

    priceItems: (items) => priceCart(items, products),

    createOrder(input, now = new Date()) {
      const cart = priceCart(input.itens, products)
      if (cart.avisos.length > 0 || cart.linhas.length === 0) return { ok: false, cart }

      for (const line of cart.linhas) {
        const variant = findVariant(line.varianteId)
        if (variant) variant.estoque -= line.quantidade
      }

      let codigo = generateOrderCode()
      while (orders.has(codigo)) codigo = generateOrderCode()
      const order: MockStoreOrder = {
        codigo,
        status: ORDER_STATUS.PENDING,
        nomeCompleto: input.nomeCompleto,
        cpf: input.cpf,
        whatsapp: input.whatsapp,
        email: input.email,
        valorTotalCentavos: cart.totalCentavos,
        criadoEm: now.toISOString(),
        expiraEm: new Date(now.getTime() + ORDER_RESERVATION_MINUTES * 60_000).toISOString(),
        pagoEm: null,
        retiradoEm: null,
        accessToken: randomUUID(),
        itens: cart.linhas.map((line) => ({
          varianteId: line.varianteId,
          produtoNome: line.produtoNome,
          varianteRotulo: line.varianteRotulo,
          quantidade: line.quantidade,
          precoUnitarioCentavos: line.precoUnitarioCentavos,
        })),
        retiradas: [...new Set(cart.linhas.map((line) => line.retirada))],
        aprovacaoEm: null,
      }
      orders.set(codigo, order)
      return { ok: true, order: clone(order) }
    },

    getOrder(codigo, now = new Date()) {
      const order = orders.get(codigo)
      if (!order) return null
      settle(order, now)
      return clone(order)
    },

    listOrders(now = new Date()) {
      const all = [...orders.values()]
      for (const order of all) settle(order, now)
      return clone(all.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)))
    },

    transitionOrder(codigo, action, now = new Date()) {
      const order = orders.get(codigo)
      if (!order) return null
      settle(order, now)
      const next = TRANSITIONS[action][order.status]
      if (!next) return null
      if (order.status === ORDER_STATUS.PENDING && next === ORDER_STATUS.CANCELLED) restock(order)
      if (next === ORDER_STATUS.PICKED_UP) order.retiradoEm = now.toISOString()
      order.status = next
      return clone(order)
    },

    scheduleApproval(codigo, at) {
      const order = orders.get(codigo)
      if (order?.status === ORDER_STATUS.PENDING) order.aprovacaoEm = at
    },

    saveProduct(data, id) {
      // Id desconhecido nunca vira um produto novo.
      const existing = id ? products.find((item) => item.id === id) : undefined
      if (id && !existing) throw new ProductNotFoundError()
      if (products.some((item) => item.slug === data.slug && item.id !== id)) throw new DuplicateSlugError()

      const { variantes, ...fields } = data
      const allVariantIds = products.flatMap((product) => product.variantes.map((variant) => variant.id))

      if (existing) {
        // Valida tudo antes de alterar qualquer coisa (como numa transação).
        const savedById = new Map(existing.variantes.map((variant) => [variant.id, variant]))
        const incomingIds = new Set(variantes.flatMap((variant) => (variant.id ? [variant.id] : [])))
        if ([...incomingIds].some((variantId) => !savedById.has(variantId))) throw new VariantNotOwnedError()

        // Como o backend: variante salva omitida fica inativa (não é apagada); variante nova com o rótulo
        // de uma omitida ou inativa reativa essa variante (o índice único do rótulo não deixa criar outra).
        const omitted = existing.variantes.filter((variant) => !incomingIds.has(variant.id))
        const omittedByLabel = new Map(omitted.map((variant) => [variant.rotulo.toUpperCase(), variant]))
        const reactivated = new Set<string>()

        // Estoque editado vira diferença sobre o estoque ATUAL: não apaga reservas feitas durante a edição.
        let newId = Number(nextNumericId(allVariantIds))
        const nextVariants: MockStoreVariant[] = variantes.map((variant) => {
          const saved = variant.id ? savedById.get(variant.id) : undefined
          if (!saved) {
            const previous = omittedByLabel.get(variant.rotulo.toUpperCase())
            if (!previous) return { id: String(newId++), rotulo: variant.rotulo, estoque: variant.estoque }
            reactivated.add(previous.id)
            return { id: previous.id, rotulo: variant.rotulo, estoque: variant.estoque }
          }
          const estoque = saved.estoque + variant.estoque - (variant.estoqueOriginal ?? variant.estoque)
          if (estoque < 0) throw new StockChangedError()
          return { id: saved.id, rotulo: variant.rotulo, estoque }
        })

        Object.assign(existing, fields)
        const deactivated = omitted.filter((variant) => !reactivated.has(variant.id)).map((variant) => ({ ...variant, ativo: false }))
        existing.variantes = [...nextVariants, ...deactivated]
        return clone(existing)
      }

      let newId = Number(nextNumericId(allVariantIds))
      const created: MockStoreProduct = {
        ...fields,
        id: nextNumericId(products.map((product) => product.id)),
        ordem: products.length + 1,
        fotos: [],
        variantes: variantes.map((variant) => ({ id: String(newId++), rotulo: variant.rotulo, estoque: variant.estoque })),
      }
      products.push(created)
      return clone(created)
    },
  }
}
