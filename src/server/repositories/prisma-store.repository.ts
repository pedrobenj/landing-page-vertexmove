import "server-only"

import { Prisma } from "@/generated/prisma/client"
import { OrderStatus } from "@/generated/prisma/enums"
import { generateOrderCode } from "@/lib/utils/generate-code"
import { getFirstName } from "@/lib/utils/get-first-name"
import { isUniqueViolationOn } from "@/lib/utils/unique-violation-target"
import type { ProductFormData } from "@/lib/validations/product.schema"
import { db } from "@/server/db"
import { DuplicateSlugError, DuplicateVariantLabelError, StockChangedError, VariantNotOwnedError } from "@/server/errors"
import type { StoreProduct } from "@/types/store-product.interface"

import type { StoreRepository } from "./store-repository.interface"

const productInclude = {
  variants: { orderBy: { position: "asc" }, select: { id: true, label: true, stock: true } },
} satisfies Prisma.ProductInclude

type ProductWithVariants = Prisma.ProductGetPayload<{ include: typeof productInclude }>

function toStoreProduct(product: ProductWithVariants): StoreProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    type: product.type,
    imageUrls: product.imageUrls,
    price: product.price,
    pickupInfo: product.pickupInfo,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    variants: product.variants,
  }
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
}

/** P2002 no slug vira DuplicateSlugError; nos tamanhos (productId + label), DuplicateVariantLabelError. */
function toSaveProductError(error: unknown): unknown {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return error
  return isUniqueViolationOn(error.meta, "slug") ? new DuplicateSlugError() : new DuplicateVariantLabelError()
}

class OutOfStockError extends Error {
  constructor(readonly variantIds: string[]) {
    super("Estoque insuficiente")
  }
}

const MAX_CODE_ATTEMPTS = 3

/** Rótulo provisório e único, usado para permitir trocas de rótulo (P↔M) sem violar @@unique([productId, label]). */
function temporaryLabel(variantId: string): string {
  return `__tmp__${variantId}`
}

export const prismaStoreRepository: StoreRepository = {
  async listActiveProducts() {
    const products = await db.product.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { createdAt: "desc" }],
      include: productInclude,
    })
    return products.map(toStoreProduct)
  },

  async listFeaturedProducts(limit) {
    const products = await db.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: productInclude,
    })
    return products.map(toStoreProduct)
  },

  async getActiveProductBySlug(slug) {
    const product = await db.product.findFirst({ where: { slug, isActive: true }, include: productInclude })
    return product ? toStoreProduct(product) : null
  },

  async getProductsByVariantIds(variantIds) {
    const products = await db.product.findMany({
      where: { variants: { some: { id: { in: variantIds } } } },
      include: productInclude,
    })
    return products.map(toStoreProduct)
  },

  async createPendingOrder(data) {
    for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt++) {
      try {
        return await db.$transaction(async (tx) => {
          const outOfStock: string[] = []
          // Ordem fixa por variantId: duas transações travam as linhas na mesma ordem e não entram em deadlock.
          const sortedLines = [...data.lines].sort((a, b) => (a.variantId < b.variantId ? -1 : a.variantId > b.variantId ? 1 : 0))
          for (const line of sortedLines) {
            // Update condicional: só baixa se ainda houver estoque. Evita vender além do que existe.
            const { count } = await tx.productVariant.updateMany({
              where: { id: line.variantId, stock: { gte: line.quantity } },
              data: { stock: { decrement: line.quantity } },
            })
            if (count === 0) outOfStock.push(line.variantId)
          }
          if (outOfStock.length > 0) throw new OutOfStockError(outOfStock)

          const order = await tx.order.create({
            data: {
              code: generateOrderCode(),
              buyerName: data.buyer.name,
              buyerCpf: data.buyer.cpf,
              buyerWhatsapp: data.buyer.whatsapp,
              buyerEmail: data.buyer.email,
              amount: data.amount,
              status: OrderStatus.PENDING,
              expiresAt: data.expiresAt,
              privacyAcceptedAt: data.privacyAcceptedAt,
              items: { create: data.lines },
            },
            select: { code: true },
          })
          return { ok: true as const, code: order.code }
        })
      } catch (error) {
        if (error instanceof OutOfStockError) return { ok: false, outOfStockVariantIds: error.variantIds }
        if (isUniqueViolation(error) && attempt < MAX_CODE_ATTEMPTS) continue // colisão de código: tenta outro
        throw error
      }
    }
    throw new Error("Não foi possível gerar um código de pedido único")
  },

  async getOrderSummaryByCode(code) {
    const order = await db.order.findUnique({
      where: { code },
      include: { items: { include: { variant: { select: { product: { select: { pickupInfo: true } } } } } } },
    })
    if (!order) return null
    return {
      code: order.code,
      status: order.status,
      amount: order.amount,
      buyerFirstName: getFirstName(order.buyerName),
      createdAt: order.createdAt,
      expiresAt: order.expiresAt,
      items: order.items.map(({ productName, variantLabel, quantity, unitPrice }) => ({ productName, variantLabel, quantity, unitPrice })),
      pickupInfos: [...new Set(order.items.map((item) => item.variant.product.pickupInfo))],
    }
  },

  async listAllProducts() {
    const products = await db.product.findMany({ orderBy: { createdAt: "desc" }, include: productInclude })
    return products.map(toStoreProduct)
  },

  async getProductById(id) {
    const product = await db.product.findUnique({ where: { id }, include: productInclude })
    return product ? toStoreProduct(product) : null
  },

  async saveProduct(data: ProductFormData, id?: string) {
    const { variants, ...fields } = data
    try {
      if (!id) {
        const created = await db.product.create({
          data: {
            ...fields,
            imageUrls: [],
            variants: { create: variants.map((v, position) => ({ label: v.label, stock: v.stock, position })) },
          },
          include: productInclude,
        })
        return toStoreProduct(created)
      }

      const updated = await db.$transaction(async (tx) => {
        await tx.product.update({ where: { id }, data: fields })

        const existingVariants = variants.flatMap((variant, position) => (variant.id ? [{ ...variant, id: variant.id, position }] : []))

        // Fase 1: confere que cada tamanho é deste produto e libera o rótulo atual (permite trocar P↔M).
        for (const variant of existingVariants) {
          const { count } = await tx.productVariant.updateMany({
            where: { id: variant.id, productId: id },
            data: { label: temporaryLabel(variant.id) },
          })
          if (count === 0) throw new VariantNotOwnedError()
        }

        // Fase 2: rótulo e posição finais; o estoque editado vira diferença sobre o estoque ATUAL,
        // para não apagar reservas de pedidos feitas enquanto o admin editava.
        for (const variant of existingVariants) {
          const delta = variant.stock - (variant.originalStock ?? variant.stock)
          const { count } = await tx.productVariant.updateMany({
            where: { id: variant.id, productId: id, ...(delta < 0 ? { stock: { gte: -delta } } : {}) },
            data: { label: variant.label, stock: { increment: delta }, position: variant.position },
          })
          // A fase 1 já provou a posse: count 0 aqui só pode ser estoque que ficaria negativo.
          if (count === 0) throw new StockChangedError()
        }

        for (const [position, variant] of variants.entries()) {
          if (!variant.id) {
            await tx.productVariant.create({ data: { productId: id, label: variant.label, stock: variant.stock, position } })
          }
        }

        return tx.product.findUniqueOrThrow({ where: { id }, include: productInclude })
      })
      return toStoreProduct(updated)
    } catch (error) {
      throw toSaveProductError(error)
    }
  },
}
