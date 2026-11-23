import { beforeEach, describe, expect, it, vi } from "vitest"

import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { Transport } from "@/server/api/transport"

const mockEnv = vi.hoisted(() => ({ NODE_ENV: "test", API_URL: "http://api.test", API_TIMEOUT_MS: 5_000, USE_MOCK_API: true }))
const override = vi.hoisted(() => ({ transport: null as Transport | null }))
const jar = vi.hoisted(() => new Map<string, { value: string; options?: Record<string, unknown> }>())

vi.mock("@/lib/env", () => ({ env: mockEnv }))
vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)!.value } : undefined),
    set: (name: string, value: string, options?: Record<string, unknown>) => jar.set(name, { value, options }),
  }),
}))
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
  unstable_rethrow: () => {},
  RedirectType: { push: "push", replace: "replace" },
}))
vi.mock("@/server/api/transport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/api/transport")>()
  return { getTransport: async () => override.transport ?? actual.getTransport() }
})

const { redeemAccessLinkAction, requestAccessLinkAction } = await import("./registration-access")
const { ACCESS_LINK_SENT_MESSAGE } = await import("@/lib/utils/registration-access-messages")
const { getMockDb, resetMockDb } = await import("@/server/api/mocks/mock-db")

function athleteWithEmail() {
  const registration = getMockDb().registrations.find(
    (item) => item.email && item.cpf && item.status === REGISTRATION_STATUS.PENDING,
  )
  if (!registration?.cpf) throw new Error("seed sem inscrição pendente com e-mail e CPF")
  return { ...registration, cpf: registration.cpf }
}

function lastToken(): string {
  const [email] = getMockDb().outbox
  return new URL(email.link, "http://site.test").searchParams.get("t") ?? ""
}

function failWith(status: number, codigo: string): Transport {
  return async () => Response.json({ error: { codigo, mensagem: "x" } }, { status })
}

describe("requestAccessLinkAction", () => {
  beforeEach(() => {
    resetMockDb()
    override.transport = null
  })

  it("202 com a mesma mensagem, exista ou não inscrição", async () => {
    const known = await requestAccessLinkAction({ tipo: "cpf", valor: athleteWithEmail().cpf })
    const unknown = await requestAccessLinkAction({ tipo: "whatsapp", valor: "(85) 90000-0001" })
    expect(known).toEqual({ status: 202, title: ACCESS_LINK_SENT_MESSAGE })
    expect(unknown).toEqual(known)
    expect(ACCESS_LINK_SENT_MESSAGE).toMatch(/30 minutos/)
  })

  it("normaliza a entrada como a consulta (CPF só dígitos) e o mock envia o link", async () => {
    const registration = athleteWithEmail()
    const masked = registration.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
    await requestAccessLinkAction({ tipo: "cpf", valor: masked })
    expect(getMockDb().outbox[0]).toMatchObject({ codigo: registration.codigo })
  })

  it("entrada inválida → 422 no campo, sem chamar a API", async () => {
    const response = await requestAccessLinkAction({ tipo: "cpf", valor: "123" })
    expect(response).toMatchObject({ status: 422, code: "DADO_INVALIDO" })
    expect(getMockDb().outbox).toHaveLength(0)
  })

  it("rate limit → 429 com mensagem de aguardar (sem dizer se há cadastro)", async () => {
    override.transport = failWith(429, "LIMITE_EXCEDIDO")
    const response = await requestAccessLinkAction({ tipo: "cpf", valor: athleteWithEmail().cpf })
    expect(response).toMatchObject({ status: 429, code: "LIMITE_EXCEDIDO", error: expect.stringMatching(/Aguarde/) })
  })
})

describe("redeemAccessLinkAction", () => {
  beforeEach(() => {
    resetMockDb()
    jar.clear()
    override.transport = null
  })

  it("troca o token, grava o cookie da inscrição e redireciona para /inscricao/<codigo>", async () => {
    const registration = athleteWithEmail()
    await requestAccessLinkAction({ tipo: "cpf", valor: registration.cpf })

    await expect(redeemAccessLinkAction(lastToken())).rejects.toThrow(`REDIRECT:/inscricao/${registration.codigo}`)
    const cookie = jar.get(`vm_insc_${registration.codigo}`)
    expect(cookie?.value).toBe(getMockDb().registrations.find((item) => item.codigo === registration.codigo)?.accessToken)
    expect(cookie?.options).toMatchObject({ httpOnly: true })
  })

  it("link já usado → 410 LINK_ACESSO_INVALIDO com mensagem clara", async () => {
    await requestAccessLinkAction({ tipo: "cpf", valor: athleteWithEmail().cpf })
    const token = lastToken()
    await redeemAccessLinkAction(token).catch(() => undefined)
    jar.clear()

    const response = await redeemAccessLinkAction(token)
    expect(response).toMatchObject({ status: 410, code: "LINK_ACESSO_INVALIDO", error: expect.stringMatching(/expirou ou já foi usado/) })
    expect(jar.size).toBe(0)
  })

  it("token malformado → inválido sem chamar a API", async () => {
    override.transport = async () => {
      throw new Error("não deveria chamar a API")
    }
    expect(await redeemAccessLinkAction("")).toMatchObject({ status: 410, code: "LINK_ACESSO_INVALIDO" })
    expect(await redeemAccessLinkAction("a b<c>")).toMatchObject({ status: 410, code: "LINK_ACESSO_INVALIDO" })
    expect(await redeemAccessLinkAction("a".repeat(129))).toMatchObject({ status: 410, code: "LINK_ACESSO_INVALIDO" })
  })

  it("rate limit e API fora não viram 'link inválido'", async () => {
    override.transport = failWith(429, "LIMITE_EXCEDIDO")
    expect(await redeemAccessLinkAction("abc_DEF-123")).toMatchObject({ status: 429, code: "LIMITE_EXCEDIDO" })
    override.transport = failWith(503, "SERVICO_INDISPONIVEL")
    expect(await redeemAccessLinkAction("abc_DEF-123")).toMatchObject({ status: 503 })
  })
})
