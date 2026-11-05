import { randomUUID } from "node:crypto"

import { generateOrderCode } from "@/lib/utils/generate-code"
import { getFirstName } from "@/lib/utils/get-first-name"
import type { ProductFormData } from "@/lib/validations/product.schema"
import { DuplicateSlugError, DuplicateVariantLabelError, StockChangedError, VariantNotOwnedError } from "@/server/errors"
import type { NewOrderData, OrderSummary } from "@/types/order.interface"
import type { StoreProduct } from "@/types/store-product.interface"

import type { StoreRepository } from "./store-repository.interface"

interface MockOrder extends OrderSummary {
  buyerCpf: string
  variantIds: string[]
}

/** Repositório em memória para desenvolvimento e testes. Estado some ao reiniciar o servidor. */
export function createMockStoreRepository(seed: StoreProduct[]): StoreRepository {
  const products: StoreProduct[] = structuredClone(seed)
  const orders = new Map<string, MockOrder>()

  const clone = <T>(value: T): T => structuredClone(value)
  const findVariant = (variantId: string) => {
    for (const product of products) {
      const variant = product.variants.find((v) => v.id === variantId)
      if (variant) return { product, variant }
    }
    return null
  }

  return {
    async listActiveProducts() {
      return clone(products.filter((p) => p.isActive))
    },

    async listFeaturedProducts(limit) {
      return clone(products.filter((p) => p.isActive && p.isFeatured).slice(0, limit))
    },

    async getActiveProductBySlug(slug) {
      const product = products.find((p) => p.slug === slug && p.isActive)
      return product ? clone(product) : null
    },

    async getProductsByVariantIds(variantIds) {
      const ids = new Set(variantIds)
      return clone(products.filter((p) => p.variants.some((v) => ids.has(v.id))))
    },

    async createPendingOrder(data: NewOrderData) {
      // Verifica tudo antes de baixar (equivale à transação no Prisma).
      const outOfStock = data.lines
        .filter((line) => (findVariant(line.variantId)?.variant.stock ?? 0) < line.quantity)
        .map((line) => line.variantId)
      if (outOfStock.length > 0) return { ok: false, outOfStockVariantIds: outOfStock }

      for (const line of data.lines) {
        const match = findVariant(line.variantId)
        if (match) match.variant.stock -= line.quantity
      }

      const pickupInfos = [...new Set(data.lines.map((l) => findVariant(l.variantId)?.product.pickupInfo ?? ""))].filter(Boolean)
      const code = generateOrderCode()
      orders.set(code, {
        code,
        status: "PENDING",
        amount: data.amount,
        buyerFirstName: getFirstName(data.buyer.name),
        buyerCpf: data.buyer.cpf,
        createdAt: new Date(),
        expiresAt: data.expiresAt,
        items: data.lines.map(({ productName, variantLabel, quantity, unitPrice }) => ({ productName, variantLabel, quantity, unitPrice })),
        pickupInfos,
        variantIds: data.lines.map((l) => l.variantId),
      })
      return { ok: true, code }
    },

    async getOrderSummaryByCode(code) {
      const found = orders.get(code)
      if (!found) return null
      const summary = clone(found) as Partial<MockOrder>
      delete summary.buyerCpf
      delete summary.variantIds
      return summary as OrderSummary
    },

    async listAllProducts() {
      return clone(products)
    },

    async getProductById(id) {
      const product = products.find((p) => p.id === id)
      return product ? clone(product) : null
    },

    async saveProduct(data: ProductFormData, id?: string) {
      if (products.some((p) => p.slug === data.slug && p.id !== id)) throw new DuplicateSlugError()

      const { variants, ...fields } = data
      const existing = id ? products.find((p) => p.id === id) : undefined

      if (existing) {
        // Valida tudo antes de alterar qualquer coisa (equivale à transação no Prisma).
        const savedById = new Map(existing.variants.map((v) => [v.id, v]))
        const incomingIds = new Set(variants.flatMap((variant) => (variant.id ? [variant.id] : [])))
        if ([...incomingIds].some((variantId) => !savedById.has(variantId))) throw new VariantNotOwnedError()

        // Tamanhos salvos que não vieram no formulário continuam existindo (igual ao Prisma).
        const omitted = existing.variants.filter((v) => !incomingIds.has(v.id))
        const omittedLabels = new Set(omitted.map((v) => v.label))
        if (variants.some((variant) => omittedLabels.has(variant.label))) throw new DuplicateVariantLabelError()

        // Estoque editado vira diferença sobre o estoque ATUAL: não apaga reservas feitas durante a edição.
        const nextVariants = variants.map((variant) => {
          const saved = variant.id ? savedById.get(variant.id) : undefined
          if (!saved) return { id: `mock-var-${randomUUID()}`, label: variant.label, stock: variant.stock }
          const stock = saved.stock + variant.stock - (variant.originalStock ?? variant.stock)
          if (stock < 0) throw new StockChangedError()
          return { id: saved.id, label: variant.label, stock }
        })

        Object.assign(existing, fields)
        existing.variants = [...nextVariants, ...omitted]
        return clone(existing)
      }

      const created: StoreProduct = {
        ...fields,
        id: `mock-prod-${randomUUID()}`,
        imageUrls: [],
        variants: variants.map((variant) => ({ id: `mock-var-${randomUUID()}`, label: variant.label, stock: variant.stock })),
      }
      products.push(created)
      return clone(created)
    },
  }
}
