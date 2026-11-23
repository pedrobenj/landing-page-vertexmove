import { beforeEach, describe, expect, it } from "vitest"

import type { AdminLoginResponse } from "@/types/api/admin-auth.interface"
import type { CreatedManagedAdmin, ManagedAdmin, TemporaryPassword } from "@/types/api/managed-admin.interface"

import { getMockDb, resetMockDb } from "../mock-db"
import { mockFetch } from "../mock-fetch"

function call(method: string, path: string, { body, headers }: { body?: unknown; headers?: Record<string, string> } = {}) {
  return mockFetch(`http://api.test/api/v1${path}`, {
    method,
    headers: { Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

async function error(res: Response): Promise<{ codigo: string; detalhes?: { campo: string; regra: string }[] }> {
  return ((await res.json()) as { error: { codigo: string; detalhes?: { campo: string; regra: string }[] } }).error
}

async function login(email: string, senha = "Vertex@Dev12345"): Promise<Response> {
  return call("POST", "/admin/auth/login", { body: { email, senha } })
}

let auth: Record<string, string>

describe("gestão de admins no mock (contrato do backend, fase 8)", () => {
  beforeEach(async () => {
    resetMockDb()
    auth = { Authorization: `Bearer ${((await (await login("admin@example.com")).json()) as AdminLoginResponse).accessToken}` }
  })

  it("lista ativos e inativos por nome, sem senha; exige Bearer", async () => {
    expect((await call("GET", "/admin/admins")).status).toBe(401)
    const res = await call("GET", "/admin/admins", { headers: auth })
    const admins = (await res.json()) as ManagedAdmin[]
    expect(res.status).toBe(200)
    expect(admins.map((admin) => admin.nome)).toEqual([...admins.map((admin) => admin.nome)].sort((a, b) => a.localeCompare(b, "pt-BR")))
    expect(Object.keys(admins[0]!).sort()).toEqual(["ativo", "criadoEm", "email", "id", "nome", "papel", "ultimoAcessoEm"])
  })

  it("cria com senha temporária (24 chars base64url) que permite entrar; e-mail repetido é 409", async () => {
    const res = await call("POST", "/admin/admins", { body: { nome: "Maria Souza", email: " Maria@Vertex.com.br " }, headers: auth })
    const created = (await res.json()) as CreatedManagedAdmin
    expect(res.status).toBe(201)
    expect(res.headers.get("Location")).toBe(`/api/v1/admin/admins/${created.admin.id}`)
    expect(created.admin).toMatchObject({ nome: "Maria Souza", email: "maria@vertex.com.br", papel: "admin", ativo: true, ultimoAcessoEm: null })
    expect(created.senhaTemporaria).toMatch(/^[A-Za-z0-9_-]{24}$/)
    expect((await login("maria@vertex.com.br", created.senhaTemporaria)).status).toBe(200)
    expect(getMockDb().audit.at(-1)).toMatchObject({ acao: "criar", entidade: "admin" })

    const duplicate = await call("POST", "/admin/admins", { body: { nome: "Outra", email: "maria@vertex.com.br" }, headers: auth })
    expect(duplicate.status).toBe(409)
    expect((await error(duplicate)).codigo).toBe("ADMIN_EMAIL_EM_USO")
    const strict = await call("POST", "/admin/admins", { body: { nome: "X", email: "x@vertex.com.br", senha: "y" }, headers: auth })
    expect(strict.status).toBe(422)
  })

  it("senha temporária: /admin/me avisa (trocarSenha) e o resto responde 403 até trocar", async () => {
    const created = (await (await call("POST", "/admin/admins", { body: { nome: "Nova Pessoa", email: "nova@vertex.com.br" }, headers: auth })).json()) as CreatedManagedAdmin
    const token = ((await (await login("nova@vertex.com.br", created.senhaTemporaria)).json()) as AdminLoginResponse).accessToken
    const own = { Authorization: `Bearer ${token}` }

    expect(await (await call("GET", "/admin/me", { headers: own })).json()).toMatchObject({ trocarSenha: true })
    const blocked = await call("GET", "/admin/eventos", { headers: own })
    expect(blocked.status).toBe(403)
    expect((await error(blocked)).codigo).toBe("TROCA_DE_SENHA_OBRIGATORIA")
    expect(await (await call("GET", "/admin/me", { headers: auth })).json()).toMatchObject({ trocarSenha: false })

    const changed = await call("POST", "/admin/me/senha", { body: { senhaAtual: created.senhaTemporaria, novaSenha: "Nova@Senha12345" }, headers: own })
    expect(changed.status).toBe(204)
    const fresh = ((await (await login("nova@vertex.com.br", "Nova@Senha12345")).json()) as AdminLoginResponse).accessToken
    expect((await call("GET", "/admin/eventos", { headers: { Authorization: `Bearer ${fresh}` } })).status).toBe(200)

    // Redefinir marca de novo.
    await call("POST", `/admin/admins/${created.admin.id}/redefinir-senha`, { headers: auth })
    expect(getMockDb().admins.find((admin) => admin.id === created.admin.id)?.senhaTemporaria).toBe(true)
  })

  it("desativar barra o login e o token; reativar devolve o acesso; a si mesmo é 409", async () => {
    const operatorToken = ((await (await login("operador@example.com")).json()) as AdminLoginResponse).accessToken
    const res = await call("POST", "/admin/admins/2/desativar", { headers: auth })
    expect(res.status).toBe(200)
    expect(((await res.json()) as ManagedAdmin).ativo).toBe(false)
    expect((await login("operador@example.com")).status).toBe(401)
    expect((await call("GET", "/admin/me", { headers: { Authorization: `Bearer ${operatorToken}` } })).status).toBe(401)

    expect((await call("POST", "/admin/admins/2/reativar", { headers: auth })).status).toBe(200)
    expect((await login("operador@example.com")).status).toBe(200)

    const self = await call("POST", "/admin/admins/1/desativar", { headers: auth })
    expect(self.status).toBe(409)
    expect((await error(self)).codigo).toBe("OPERACAO_NO_PROPRIO_ADMIN")
    expect((await call("POST", "/admin/admins/999/desativar", { headers: auth })).status).toBe(404)
    expect((await call("POST", "/admin/admins/abc/reativar", { headers: auth })).status).toBe(422)
  })

  it("redefinir senha devolve uma nova temporária (a antiga deixa de valer); a própria é 409", async () => {
    const res = await call("POST", "/admin/admins/2/redefinir-senha", { headers: auth })
    const { senhaTemporaria } = (await res.json()) as TemporaryPassword
    expect(res.status).toBe(200)
    expect(senhaTemporaria).toMatch(/^[A-Za-z0-9_-]{24}$/)
    expect((await login("operador@example.com")).status).toBe(401)
    expect((await login("operador@example.com", senhaTemporaria)).status).toBe(200)
    expect((await error(await call("POST", "/admin/admins/1/redefinir-senha", { headers: auth }))).codigo).toBe("OPERACAO_NO_PROPRIO_ADMIN")
  })

  it("trocar a própria senha: 204, regras como o backend e senha atual errada", async () => {
    const change = (body: unknown) => call("POST", "/admin/me/senha", { body, headers: auth })
    const wrong = await change({ senhaAtual: "errada", novaSenha: "Nova senha forte 2026" })
    expect(wrong.status).toBe(422)
    expect((await error(wrong)).codigo).toBe("SENHA_ATUAL_INCORRETA")
    for (const [novaSenha, regra] of [
      ["curta", "tamanho_minimo"],
      ["x".repeat(129), "tamanho_maximo"],
      ["troque-esta-senha", "senha_obvia"],
      ["Vertex@Dev12345", "igual_a_atual"],
    ] as const) {
      const res = await change({ senhaAtual: "Vertex@Dev12345", novaSenha })
      expect(res.status, regra).toBe(422)
      expect((await error(res)).detalhes?.[0]).toEqual({ campo: "novaSenha", regra })
    }
    const ok = await change({ senhaAtual: "Vertex@Dev12345", novaSenha: "Nova senha forte 2026" })
    expect(ok.status).toBe(204)
    expect((await login("admin@example.com", "Nova senha forte 2026")).status).toBe(200)
  })
})
