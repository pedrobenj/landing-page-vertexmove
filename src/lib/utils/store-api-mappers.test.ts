import { describe, expect, it } from "vitest"

import { CART_ISSUE_REASON } from "@/enums/cart-issue-reason.enum"
import { ORDER_STATUS } from "@/enums/order-status.enum"
import { PRODUCT_TYPE } from "@/enums/product-type.enum"
import type { ApiPricedCart } from "@/types/api/store-cart.interface"
import type { ApiStoreOrderSummary } from "@/types/api/store-order.interface"
import type { ApiAdminStoreProduct, ApiStoreProduct } from "@/types/api/store-product.interface"

import {
  toApiCartItems,
  toApiCreateStoreOrder,
  toApiSaveStoreProduct,
  toOrderSummary,
  toPricedCart,
  toStoreProduct,
} from "./store-api-mappers"

const apiProduct: ApiStoreProduct = {
  id: "67",
  slug: "camisa-oficial",
  nome: "Camisa Oficial",
  descricao: "Dry-fit leve.",
  tipo: PRODUCT_TYPE.SHIRT,
  precoCentavos: 8990,
  retirada: "Na sede",
  destaque: true,
  fotos: [
    { url: "https://cdn.test/b.jpg", alt: null, ordem: 2 },
    { url: "https://cdn.test/a.jpg", alt: "Frente", ordem: 1 },
  ],
  variantes: [{ id: "74", rotulo: "P", estoque: 10 }],
}

describe("toStoreProduct", () => {
  it("traduz o produto público (fotos na ordem, ativo implícito)", () => {
    expect(toStoreProduct(apiProduct)).toEqual({
      id: "67",
      slug: "camisa-oficial",
      name: "Camisa Oficial",
      description: "Dry-fit leve.",
      type: PRODUCT_TYPE.SHIRT,
      imageUrls: ["https://cdn.test/a.jpg", "https://cdn.test/b.jpg"],
      price: 8990,
      pickupInfo: "Na sede",
      isActive: true,
      isFeatured: true,
      variants: [{ id: "74", label: "P", stock: 10 }],
    })
  })

  it("usa `ativo` do produto do admin", () => {
    const admin: ApiAdminStoreProduct = {
      ...apiProduct,
      variantes: [{ id: "74", rotulo: "P", estoque: 10, ordem: 0 }],
      ativo: false,
      ordem: 0,
      criadoEm: "2026-11-01T12:00:00.000Z",
      atualizadoEm: "2026-11-01T12:00:00.000Z",
    }
    expect(toStoreProduct(admin).isActive).toBe(false)
  })
})

describe("toPricedCart", () => {
  const cart: ApiPricedCart = {
    linhas: [
      {
        varianteId: "74",
        produtoId: "67",
        produtoSlug: "camisa-oficial",
        produtoNome: "Camisa Oficial",
        produtoTipo: PRODUCT_TYPE.SHIRT,
        varianteRotulo: "P",
        fotoUrl: null,
        precoUnitarioCentavos: 8990,
        quantidade: 2,
        totalCentavos: 17980,
        retirada: "Na sede",
      },
    ],
    avisos: [
      { varianteId: "74", motivo: CART_ISSUE_REASON.INSUFFICIENT_STOCK, quantidadeDisponivel: 2 },
      { varianteId: "76", motivo: CART_ISSUE_REASON.INSUFFICIENT_STOCK, quantidadeDisponivel: 0 },
      { varianteId: "99", motivo: CART_ISSUE_REASON.UNAVAILABLE, quantidadeDisponivel: 0 },
    ],
    totalCentavos: 17980,
    quantidadeItens: 2,
  }

  it("traduz linhas e totais", () => {
    const priced = toPricedCart(cart)
    expect(priced.lines[0]).toEqual({
      variantId: "74",
      productId: "67",
      productSlug: "camisa-oficial",
      productName: "Camisa Oficial",
      productType: PRODUCT_TYPE.SHIRT,
      variantLabel: "P",
      imageUrl: null,
      unitPrice: 8990,
      quantity: 2,
      lineTotal: 17980,
      pickupInfo: "Na sede",
    })
    expect(priced).toMatchObject({ total: 17980, itemCount: 2 })
  })

  it("gera a mensagem de cada aviso (com o nome quando a linha existe)", () => {
    expect(toPricedCart(cart).issues).toEqual([
      { variantId: "74", reason: CART_ISSUE_REASON.INSUFFICIENT_STOCK, availableQuantity: 2, message: "Só restam 2 unidades de Camisa Oficial (P)" },
      { variantId: "76", reason: CART_ISSUE_REASON.INSUFFICIENT_STOCK, availableQuantity: 0, message: "Um item do seu carrinho esgotou" },
      { variantId: "99", reason: CART_ISSUE_REASON.UNAVAILABLE, availableQuantity: 0, message: "Um item do seu carrinho não está mais disponível" },
    ])
  })
})

describe("toOrderSummary", () => {
  it("traduz o resumo e converte as datas", () => {
    const raw: ApiStoreOrderSummary = {
      codigo: "VTX-P-AAAAA-BBBBB",
      status: ORDER_STATUS.PENDING,
      valorTotalCentavos: 8990,
      primeiroNome: "Maria",
      criadoEm: "2026-11-21T10:00:00.000Z",
      expiraEm: null,
      itens: [{ produtoNome: "Camisa", varianteRotulo: "P", quantidade: 1, precoUnitarioCentavos: 8990 }],
      retiradas: ["Na sede"],
    }
    expect(toOrderSummary(raw)).toEqual({
      code: "VTX-P-AAAAA-BBBBB",
      status: ORDER_STATUS.PENDING,
      amount: 8990,
      buyerFirstName: "Maria",
      createdAt: new Date("2026-11-21T10:00:00.000Z"),
      expiresAt: null,
      items: [{ productName: "Camisa", variantLabel: "P", quantity: 1, unitPrice: 8990 }],
      pickupInfos: ["Na sede"],
    })
  })
})

describe("payloads", () => {
  it("itens do carrinho", () => {
    expect(toApiCartItems([{ variantId: "74", quantity: 2 }])).toEqual([{ varianteId: "74", quantidade: 2 }])
  })

  it("pedido com WhatsApp em E.164", () => {
    expect(
      toApiCreateStoreOrder({
        name: "Maria Silva",
        cpf: "52998224725",
        whatsapp: "85988887777",
        email: "m@x.com",
        acceptPrivacy: true,
        items: [{ variantId: "74", quantity: 1 }],
      }),
    ).toEqual({
      nomeCompleto: "Maria Silva",
      cpf: "52998224725",
      whatsapp: "+5585988887777",
      email: "m@x.com",
      aceitePrivacidade: true,
      itens: [{ varianteId: "74", quantidade: 1 }],
    })
  })

  it("produto do admin com estoque por diferença só nas variantes salvas", () => {
    expect(
      toApiSaveStoreProduct({
        name: "Viseira",
        slug: "viseira",
        description: "Viseira leve.",
        type: PRODUCT_TYPE.VISOR,
        price: 4990,
        pickupInfo: "Sede",
        isActive: true,
        isFeatured: false,
        variants: [
          { id: "10", label: "U", stock: 5, originalStock: 3 },
          { label: "P", stock: 2 },
        ],
      }),
    ).toEqual({
      slug: "viseira",
      nome: "Viseira",
      descricao: "Viseira leve.",
      tipo: PRODUCT_TYPE.VISOR,
      precoCentavos: 4990,
      retirada: "Sede",
      ativo: true,
      destaque: false,
      variantes: [
        { id: "10", rotulo: "U", estoque: 5, estoqueOriginal: 3 },
        { rotulo: "P", estoque: 2 },
      ],
    })
  })
})
