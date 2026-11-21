import { describe, expect, it } from "vitest"

import { CART_ISSUE_REASON } from "@/enums/cart-issue-reason.enum"

import { priceCart } from "./cart.service"
import { buildMockProduct } from "@/test/mock-store-fixtures"

describe("priceCart (mock, formato da API)", () => {
  it("usa o preço do servidor e soma o total", () => {
    const cart = priceCart([{ varianteId: "11", quantidade: 2 }], [buildMockProduct()])
    expect(cart.avisos).toEqual([])
    expect(cart.linhas[0]).toMatchObject({ precoUnitarioCentavos: 8990, quantidade: 2, totalCentavos: 17980, varianteRotulo: "P", produtoId: "1" })
    expect(cart).toMatchObject({ totalCentavos: 17980, quantidadeItens: 2 })
  })

  it("variante inexistente, inativa ou de produto inativo → indisponivel com 0", () => {
    const inactiveVariant = buildMockProduct({ id: "2", slug: "b", variantes: [{ id: "21", rotulo: "G", estoque: 3, ativo: false }] })
    const cart = priceCart(
      [
        { varianteId: "999", quantidade: 1 },
        { varianteId: "11", quantidade: 1 },
        { varianteId: "21", quantidade: 1 },
      ],
      [buildMockProduct({ ativo: false }), inactiveVariant],
    )
    expect(cart.linhas).toEqual([])
    expect(cart.avisos).toEqual([
      { varianteId: "999", motivo: CART_ISSUE_REASON.UNAVAILABLE, quantidadeDisponivel: 0 },
      { varianteId: "11", motivo: CART_ISSUE_REASON.UNAVAILABLE, quantidadeDisponivel: 0 },
      { varianteId: "21", motivo: CART_ISSUE_REASON.UNAVAILABLE, quantidadeDisponivel: 0 },
    ])
  })

  it("esgotado → estoque_insuficiente com 0 e sai do carrinho", () => {
    const cart = priceCart([{ varianteId: "12", quantidade: 1 }], [buildMockProduct()])
    expect(cart.linhas).toEqual([])
    expect(cart.avisos).toEqual([{ varianteId: "12", motivo: CART_ISSUE_REASON.INSUFFICIENT_STOCK, quantidadeDisponivel: 0 }])
  })

  it("reduz a quantidade ao estoque disponível", () => {
    const cart = priceCart([{ varianteId: "11", quantidade: 8 }], [buildMockProduct()])
    expect(cart.linhas[0]?.quantidade).toBe(5)
    expect(cart.avisos).toEqual([{ varianteId: "11", motivo: CART_ISSUE_REASON.INSUFFICIENT_STOCK, quantidadeDisponivel: 5 }])
    expect(cart.totalCentavos).toBe(5 * 8990)
  })
})
