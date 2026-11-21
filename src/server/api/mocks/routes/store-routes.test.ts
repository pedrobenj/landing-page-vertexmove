import { beforeEach, describe, expect, it } from "vitest"

import type { AdminLoginResponse } from "@/types/api/admin-auth.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { ApiPricedCart } from "@/types/api/store-cart.interface"
import type {
  ApiAdminStoreOrder,
  ApiAdminStoreOrderDetails,
  ApiCreatedStoreOrder,
  ApiStoreOrderSummary,
} from "@/types/api/store-order.interface"
import type { ApiAdminStoreProduct, ApiStoreProduct } from "@/types/api/store-product.interface"

import { resetMockDb } from "../mock-db"
import { mockFetch } from "../mock-fetch"
import { resetMockStore } from "../store/mock-store-state"

function call(method: string, path: string, { body, headers }: { body?: unknown; headers?: Record<string, string> } = {}) {
  return mockFetch(`http://api.test/api/v1${path}`, {
    method,
    headers: { Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

async function errorOf(res: Response) {
  return ((await res.json()) as { error: { codigo: string; dados?: Record<string, unknown> } }).error
}

async function adminAuth(): Promise<Record<string, string>> {
  const res = await call("POST", "/admin/auth/login", { body: { email: "admin@example.com", senha: "Vertex@Dev12345" } })
  return { Authorization: `Bearer ${((await res.json()) as AdminLoginResponse).accessToken}` }
}

const orderBody = (varianteId: string, quantidade: number) => ({
  nomeCompleto: "Maria Silva",
  cpf: "52998224725",
  whatsapp: "+5585988887777",
  email: "m@x.com",
  aceitePrivacidade: true,
  itens: [{ varianteId, quantidade }],
})

async function createOrder(varianteId = "105", quantidade = 1): Promise<ApiCreatedStoreOrder> {
  const res = await call("POST", "/loja/pedidos", { body: orderBody(varianteId, quantidade) })
  expect(res.status).toBe(201)
  return (await res.json()) as ApiCreatedStoreOrder
}

describe("rotas da loja no mock (contrato do backend)", () => {
  beforeEach(() => {
    resetMockDb()
    resetMockStore()
  })

  it("GET /loja/produtos lista só ativos no formato ProdutoPublico", async () => {
    const products = (await (await call("GET", "/loja/produtos")).json()) as ApiStoreProduct[]
    expect(products.length).toBeGreaterThan(0)
    expect(products.map((product) => product.slug)).not.toContain("camisa-edicao-limitada-2024")
    expect(Object.keys(products[0]).sort()).toEqual(
      ["descricao", "destaque", "fotos", "id", "nome", "precoCentavos", "retirada", "slug", "tipo", "variantes"].sort(),
    )
    expect(products[0].variantes[0]).toEqual({ id: expect.stringMatching(/^\d+$/), rotulo: expect.any(String), estoque: expect.any(Number) })
  })

  it("GET /loja/produtos/:slug: inativo, inexistente ou fora do formato → 404", async () => {
    expect((await call("GET", "/loja/produtos/camisa-oficial-vertex-2026")).status).toBe(200)
    for (const slug of ["camisa-edicao-limitada-2024", "nao-existe", "Fora_Do_Formato"]) {
      const res = await call("GET", `/loja/produtos/${slug}`)
      expect(res.status).toBe(404)
      expect((await errorOf(res)).codigo).toBe("RECURSO_NAO_ENCONTRADO")
    }
  })

  it("POST /loja/carrinho/precificar valida o corpo como o backend", async () => {
    const ok = await call("POST", "/loja/carrinho/precificar", { body: { itens: [{ varianteId: "101", quantidade: 2 }] } })
    expect(((await ok.json()) as ApiPricedCart).totalCentavos).toBe(17980)
    for (const body of [{ itens: [] }, { itens: [{ varianteId: "mock-var", quantidade: 1 }] }, [{ varianteId: "101", quantidade: 1 }]]) {
      expect((await call("POST", "/loja/carrinho/precificar", { body })).status).toBe(422)
    }
  })

  it("POST /loja/pedidos: 201 sem PII e 409 CARRINHO_ALTERADO com o carrinho em error.dados", async () => {
    const created = await createOrder()
    expect(created).toEqual({ codigo: expect.stringMatching(/^VTX-P-/), accessToken: expect.any(String), expiraEm: expect.any(String) })

    const conflict = await call("POST", "/loja/pedidos", { body: orderBody("103", 1) })
    expect(conflict.status).toBe(409)
    const error = await errorOf(conflict)
    expect(error.codigo).toBe("CARRINHO_ALTERADO")
    expect((error.dados?.carrinho as ApiPricedCart).avisos).toEqual([{ varianteId: "103", motivo: "estoque_insuficiente", quantidadeDisponivel: 0 }])

    expect((await call("POST", "/loja/pedidos", { body: { ...orderBody("105", 1), aceitePrivacidade: false } })).status).toBe(422)
  })

  it("GET /loja/pedidos/:codigo devolve o resumo só com o primeiro nome", async () => {
    const { codigo } = await createOrder()
    const res = await call("GET", `/loja/pedidos/${codigo}`)
    const summary = (await res.json()) as ApiStoreOrderSummary
    expect(summary).toMatchObject({ codigo, status: "pendente", primeiroNome: "Maria", valorTotalCentavos: 6990 })
    expect(JSON.stringify(summary)).not.toMatch(/52998224725|88887777|m@x\.com|Silva/)
    expect((await call("GET", "/loja/pedidos/VTX-P-22222-22222")).status).toBe(404)
    expect((await call("GET", "/loja/pedidos/qualquer")).status).toBe(404)
  })

  it("POST /loja/pedidos/:codigo/pagamentos exige o token do pedido e a Idempotency-Key", async () => {
    const { codigo, accessToken } = await createOrder()
    const path = `/loja/pedidos/${codigo}/pagamentos`
    expect((await call("POST", path, { headers: { "Idempotency-Key": "k" } })).status).toBe(401)
    expect((await call("POST", path, { headers: { Authorization: `Bearer ${accessToken}` } })).status).toBe(422)
    const res = await call("POST", path, { headers: { Authorization: `Bearer ${accessToken}`, "Idempotency-Key": "k" } })
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ checkoutUrl: `/dev/checkout-pro/${codigo}` })
  })

  it("admin de produtos exige Bearer, cria, edita e converte conflitos", async () => {
    expect((await call("GET", "/admin/loja/produtos")).status).toBe(401)
    const auth = await adminAuth()

    const all = (await (await call("GET", "/admin/loja/produtos", { headers: auth })).json()) as ApiAdminStoreProduct[]
    expect(all.some((product) => !product.ativo)).toBe(true)

    const body = {
      slug: "viseira-nova",
      nome: "Viseira Nova",
      descricao: "Viseira leve.",
      tipo: "viseira",
      precoCentavos: 4990,
      retirada: "Sede",
      ativo: true,
      destaque: false,
      variantes: [{ rotulo: "único", estoque: 3 }],
    }
    const createdRes = await call("POST", "/admin/loja/produtos", { body, headers: auth })
    expect(createdRes.status).toBe(201)
    const created = (await createdRes.json()) as ApiAdminStoreProduct
    expect(created.variantes[0].rotulo).toBe("ÚNICO")

    const duplicate = await call("POST", "/admin/loja/produtos", { body, headers: auth })
    expect(duplicate.status).toBe(409)
    expect((await errorOf(duplicate)).codigo).toBe("PRODUTO_SLUG_EM_USO")

    const patch = await call("PATCH", `/admin/loja/produtos/${created.id}`, {
      body: { ...body, nome: "Viseira Editada", variantes: [{ id: created.variantes[0].id, rotulo: "ÚNICO", estoque: 5, estoqueOriginal: 3 }] },
      headers: auth,
    })
    expect(patch.status).toBe(200)
    expect(((await patch.json()) as ApiAdminStoreProduct).variantes[0].estoque).toBe(5)

    const foreign = await call("PATCH", `/admin/loja/produtos/${created.id}`, {
      body: { ...body, variantes: [{ id: "101", rotulo: "P", estoque: 1, estoqueOriginal: 1 }] },
      headers: auth,
    })
    expect(foreign.status).toBe(422)
    expect((await errorOf(foreign)).codigo).toBe("VARIANTE_DE_OUTRO_PRODUTO")
  })

  it("admin de pedidos: lista por status com cursor, detalhe com contato e transições", async () => {
    const auth = await adminAuth()
    const first = await createOrder()
    const second = await createOrder()

    const page = (await (await call("GET", "/admin/loja/pedidos?status=pendente&limit=1", { headers: auth })).json()) as CursorPage<ApiAdminStoreOrder>
    expect(page.items).toHaveLength(1)
    expect(page.nextCursor).toBe(page.items[0].codigo)
    const next = (await (await call("GET", `/admin/loja/pedidos?status=pendente&limit=1&cursor=${page.nextCursor}`, { headers: auth })).json()) as CursorPage<ApiAdminStoreOrder>
    expect([page.items[0].codigo, next.items[0].codigo].sort()).toEqual([first.codigo, second.codigo].sort())

    const details = (await (await call("GET", `/admin/loja/pedidos/${first.codigo}`, { headers: auth })).json()) as ApiAdminStoreOrderDetails
    expect(details).toMatchObject({ nomeCompleto: "Maria Silva", whatsapp: "+5585988887777", email: "m@x.com", cpfMascarado: "***.982.247-**" })

    expect((await call("POST", `/admin/loja/pedidos/${first.codigo}/pronto`, { headers: auth })).status).toBe(409)
    expect((await call("POST", `/admin/loja/pedidos/${first.codigo}/cancelar`, { headers: auth })).status).toBe(204)
    expect((await call("POST", `/admin/loja/pedidos/${first.codigo}/qualquer`, { headers: auth })).status).toBe(404)
  })

  it("checkout falso: aprovação simulada só vale depois do atraso do webhook", async () => {
    const { codigo } = await createOrder()
    const res = await call("POST", `/dev/loja/pedidos/${codigo}/pagamento`, { body: { resultado: "aprovado" } })
    expect(res.status).toBe(204)
    const summary = (await (await call("GET", `/loja/pedidos/${codigo}`)).json()) as ApiStoreOrderSummary
    expect(summary.status).toBe("pendente")
  })
})
