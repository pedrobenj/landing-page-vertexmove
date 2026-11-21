import { describe, expect, it } from "vitest"

import { ORDER_STATUS } from "@/enums/order-status.enum"
import { PRODUCT_TYPE } from "@/enums/product-type.enum"
import { buildMockOrderInput, buildMockProduct } from "@/test/mock-store-fixtures"
import type { ApiSaveStoreProduct } from "@/types/api/store-product.interface"

import { createMockStoreRepository } from "./mock-store.repository"
import {
  DuplicateSlugError,
  ProductNotFoundError,
  StockChangedError,
  VariantNotOwnedError,
} from "./store-errors"

const NOW = new Date("2026-11-04T12:00:00Z")
const LATER = new Date("2026-11-04T12:31:00Z")

const productData = (overrides: Partial<ApiSaveStoreProduct> = {}): ApiSaveStoreProduct => ({
  slug: "camisa-teste",
  nome: "Outra",
  descricao: "Descrição longa o bastante.",
  tipo: PRODUCT_TYPE.SHIRT,
  precoCentavos: 1000,
  retirada: "Sede",
  ativo: true,
  destaque: false,
  variantes: [{ rotulo: "U", estoque: 1 }],
  ...overrides,
})

const stockOf = (repo: ReturnType<typeof createMockStoreRepository>, varianteId: string) =>
  repo.listAllProducts().flatMap((product) => product.variantes).find((variant) => variant.id === varianteId)?.estoque

describe("mock store repository", () => {
  it("lista só os ativos, por ordem e depois nome", () => {
    const repo = createMockStoreRepository([
      buildMockProduct({ id: "1", slug: "a", nome: "Zeta", ordem: 1 }),
      buildMockProduct({ id: "2", slug: "b", nome: "Alfa", ordem: 1 }),
      buildMockProduct({ id: "3", slug: "c", ordem: 0, ativo: false }),
    ])
    expect(repo.listActiveProducts().map((product) => product.id)).toEqual(["2", "1"])
  })

  describe("pedido", () => {
    it("baixa o estoque, congela preços e reserva por 30 min", () => {
      const repo = createMockStoreRepository([buildMockProduct()])
      const result = repo.createOrder(buildMockOrderInput("11", 2), NOW)
      if (!result.ok) throw new Error("pedido deveria ter sido criado")
      expect(result.order).toMatchObject({
        status: ORDER_STATUS.PENDING,
        valorTotalCentavos: 17980,
        expiraEm: "2026-11-04T12:30:00.000Z",
        retiradas: ["Retirada na sede"],
      })
      expect(result.order.codigo).toMatch(/^VTX-P-/)
      expect(stockOf(repo, "11")).toBe(3)
    })

    it("carrinho alterado devolve o carrinho recalculado sem baixar nada", () => {
      const repo = createMockStoreRepository([buildMockProduct()])
      const result = repo.createOrder(buildMockOrderInput("11", 9), NOW)
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.cart.avisos).toEqual([{ varianteId: "11", motivo: "estoque_insuficiente", quantidadeDisponivel: 5 }])
      expect(stockOf(repo, "11")).toBe(5)
    })

    it("duas compras da última unidade: só uma passa", () => {
      const repo = createMockStoreRepository([buildMockProduct({ variantes: [{ id: "11", rotulo: "P", estoque: 1 }] })])
      const results = [repo.createOrder(buildMockOrderInput("11", 1), NOW), repo.createOrder(buildMockOrderInput("11", 1), NOW)]
      expect(results.filter((result) => result.ok)).toHaveLength(1)
      expect(stockOf(repo, "11")).toBe(0)
    })

    it("pendente vencido expira e devolve o estoque", () => {
      const repo = createMockStoreRepository([buildMockProduct()])
      const result = repo.createOrder(buildMockOrderInput("11", 2), NOW)
      if (!result.ok) throw new Error("pedido deveria ter sido criado")
      expect(repo.getOrder(result.order.codigo, LATER)?.status).toBe(ORDER_STATUS.EXPIRED)
      expect(stockOf(repo, "11")).toBe(5)
    })

    it("aprovação agendada vira pago depois do atraso do webhook", () => {
      const repo = createMockStoreRepository([buildMockProduct()])
      const result = repo.createOrder(buildMockOrderInput("11", 1), NOW)
      if (!result.ok) throw new Error("pedido deveria ter sido criado")
      repo.scheduleApproval(result.order.codigo, NOW.getTime() + 4_000)
      expect(repo.getOrder(result.order.codigo, NOW)?.status).toBe(ORDER_STATUS.PENDING)
      const paid = repo.getOrder(result.order.codigo, new Date(NOW.getTime() + 5_000))
      expect(paid).toMatchObject({ status: ORDER_STATUS.PAID, pagoEm: expect.any(String) })
    })

    it("transições do admin: pago → pronto → retirado; cancelar pendente devolve o estoque", () => {
      const repo = createMockStoreRepository([buildMockProduct()])
      const first = repo.createOrder(buildMockOrderInput("11", 1), NOW)
      const second = repo.createOrder(buildMockOrderInput("11", 2), NOW)
      if (!first.ok || !second.ok) throw new Error("pedidos deveriam ter sido criados")

      expect(repo.transitionOrder(first.order.codigo, "pronto", NOW)).toBeNull()
      repo.scheduleApproval(first.order.codigo, NOW.getTime())
      expect(repo.transitionOrder(first.order.codigo, "pronto", NOW)?.status).toBe(ORDER_STATUS.READY_FOR_PICKUP)
      expect(repo.transitionOrder(first.order.codigo, "retirado", NOW)).toMatchObject({ status: ORDER_STATUS.PICKED_UP, retiradoEm: NOW.toISOString() })
      expect(repo.transitionOrder(first.order.codigo, "cancelar", NOW)).toBeNull()

      expect(repo.transitionOrder(second.order.codigo, "cancelar", NOW)?.status).toBe(ORDER_STATUS.CANCELLED)
      expect(stockOf(repo, "11")).toBe(4)
    })

    it("lista os pedidos do mais recente para o mais antigo", () => {
      const repo = createMockStoreRepository([buildMockProduct()])
      const older = repo.createOrder(buildMockOrderInput("11", 1), NOW)
      const newer = repo.createOrder(buildMockOrderInput("11", 1), new Date(NOW.getTime() + 1_000))
      if (!older.ok || !newer.ok) throw new Error("pedidos deveriam ter sido criados")
      expect(repo.listOrders(NOW).map((order) => order.codigo)).toEqual([newer.order.codigo, older.order.codigo])
    })
  })

  describe("admin de produtos", () => {
    it("impede slug duplicado", () => {
      const repo = createMockStoreRepository([buildMockProduct()])
      expect(() => repo.saveProduct(productData())).toThrow(DuplicateSlugError)
    })

    it("cria com ids numéricos novos", () => {
      const repo = createMockStoreRepository([buildMockProduct()])
      const created = repo.saveProduct(productData({ slug: "nova" }))
      expect(created).toMatchObject({ id: "2", fotos: [], variantes: [{ id: "13", rotulo: "U", estoque: 1 }] })
    })

    it("recusa variante de outro produto, sem alterar nada", () => {
      const repo = createMockStoreRepository([
        buildMockProduct(),
        buildMockProduct({ id: "2", slug: "outra", variantes: [{ id: "21", rotulo: "G", estoque: 7 }] }),
      ])
      expect(() => repo.saveProduct(productData({ nome: "Renomeada", variantes: [{ id: "21", rotulo: "G", estoque: 99 }] }), "1")).toThrow(
        VariantNotOwnedError,
      )
      expect(repo.getProductById("1")?.nome).toBe("Camisa Teste")
      expect(repo.getProductById("2")?.variantes).toEqual([{ id: "21", rotulo: "G", estoque: 7 }])
    })

    it("aplica o estoque como diferença, preservando a reserva feita no meio da edição", () => {
      const repo = createMockStoreRepository([buildMockProduct({ variantes: [{ id: "11", rotulo: "P", estoque: 10 }] })])
      repo.createOrder(buildMockOrderInput("11", 3), NOW)
      const saved = repo.saveProduct(productData({ variantes: [{ id: "11", rotulo: "P", estoque: 12, estoqueOriginal: 10 }] }), "1")
      expect(saved.variantes[0]?.estoque).toBe(9)
    })

    it("recusa quando a diferença deixaria o estoque negativo, sem alterar nada", () => {
      const repo = createMockStoreRepository([buildMockProduct({ variantes: [{ id: "11", rotulo: "P", estoque: 10 }] })])
      repo.createOrder(buildMockOrderInput("11", 3), NOW)
      const data = productData({
        nome: "Renomeada",
        variantes: [
          { id: "11", rotulo: "P", estoque: 0, estoqueOriginal: 10 },
          { rotulo: "G", estoque: 4 },
        ],
      })
      expect(() => repo.saveProduct(data, "1")).toThrow(StockChangedError)
      expect(repo.getProductById("1")).toMatchObject({ nome: "Camisa Teste", variantes: [{ id: "11", rotulo: "P", estoque: 7 }] })
    })

    it("variante salva omitida fica inativa (não é apagada)", () => {
      const repo = createMockStoreRepository([buildMockProduct()])
      const saved = repo.saveProduct(productData({ variantes: [{ id: "11", rotulo: "P", estoque: 5, estoqueOriginal: 5 }] }), "1")
      expect(saved.variantes).toEqual([
        { id: "11", rotulo: "P", estoque: 5 },
        { id: "12", rotulo: "M", estoque: 0, ativo: false },
      ])
    })

    it("variante nova com o rótulo de uma inativa reativa a mesma variante", () => {
      const repo = createMockStoreRepository([buildMockProduct()])
      repo.saveProduct(productData({ variantes: [{ id: "11", rotulo: "P", estoque: 5, estoqueOriginal: 5 }] }), "1")
      const saved = repo.saveProduct(
        productData({ variantes: [{ id: "11", rotulo: "P", estoque: 5, estoqueOriginal: 5 }, { rotulo: "m", estoque: 4 }] }),
        "1",
      )
      expect(saved.variantes).toEqual([
        { id: "11", rotulo: "P", estoque: 5 },
        { id: "12", rotulo: "m", estoque: 4 },
      ])
    })

    it("id desconhecido nunca cria produto (e tem prioridade sobre slug duplicado)", () => {
      const repo = createMockStoreRepository([buildMockProduct()])
      expect(() => repo.saveProduct(productData(), "999")).toThrow(ProductNotFoundError)
      expect(repo.listAllProducts()).toHaveLength(1)
    })
  })
})
