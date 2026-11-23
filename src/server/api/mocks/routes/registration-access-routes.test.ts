import { beforeEach, describe, expect, it } from "vitest"

import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { MockAccessEmail, RegistrationAccessGrant } from "@/types/api/registration-access.interface"

import { getMockDb, resetMockDb } from "../mock-db"
import { mockFetch } from "../mock-fetch"
import type { MockRegistration } from "../mock-types"

function call(method: string, path: string, { body, headers }: { body?: unknown; headers?: Record<string, string> } = {}) {
  return mockFetch(`http://api.test/api/v1${path}`, {
    method,
    headers: { Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

async function errorCode(res: Response): Promise<string> {
  return ((await res.json()) as { error: { codigo: string } }).error.codigo
}

/** Inscrição ativa do seed com e-mail e CPF (o atleta que pede o link). */
function athleteWithEmail(): MockRegistration {
  const registration = getMockDb().registrations.find(
    (item) => item.email && item.cpf && item.status === REGISTRATION_STATUS.PENDING,
  )
  if (!registration) throw new Error("seed sem inscrição pendente com e-mail e CPF")
  return registration
}

async function inbox(): Promise<MockAccessEmail[]> {
  const res = await call("GET", "/dev/emails")
  expect(res.status).toBe(200)
  return (await res.json()) as MockAccessEmail[]
}

function tokenOf(email: MockAccessEmail): string {
  return new URL(email.link, "http://site.test").searchParams.get("t") ?? ""
}

describe("mock: link de acesso à inscrição (fase 6)", () => {
  beforeEach(() => resetMockDb())

  it("pedido do link: 202 sem corpo, exista ou não inscrição", async () => {
    const known = await call("POST", "/inscricoes/acesso/link", { body: { cpf: athleteWithEmail().cpf } })
    const unknown = await call("POST", "/inscricoes/acesso/link", { body: { whatsapp: "+5585900000001" } })
    expect(known.status).toBe(202)
    expect(unknown.status).toBe(202)
    expect(await known.text()).toBe("")
    expect(await unknown.text()).toBe("")
  })

  it("entrada inválida (os dois identificadores) → 422", async () => {
    const res = await call("POST", "/inscricoes/acesso/link", { body: { cpf: "52998224725", whatsapp: "+5585999990000" } })
    expect(res.status).toBe(422)
    expect(await errorCode(res)).toBe("DADO_INVALIDO")
  })

  it("envia um e-mail por inscrição ativa com e-mail, com o link /inscricao/acesso?t=", async () => {
    const registration = athleteWithEmail()
    await call("POST", "/inscricoes/acesso/link", { body: { cpf: registration.cpf } })
    const [last] = await inbox()
    expect(last).toMatchObject({ para: registration.email, codigo: registration.codigo })
    expect(last.link).toMatch(/^\/inscricao\/acesso\?t=[\w-]{20,}$/)
  })

  it("sem inscrição ou sem e-mail: nada vai para a caixa de saída", async () => {
    const before = (await inbox()).length
    await call("POST", "/inscricoes/acesso/link", { body: { whatsapp: "+5585900000001" } })
    expect(await inbox()).toHaveLength(before)
  })

  it("troca o token: devolve um novo accessToken (o anterior deixa de valer) e o link é de uso único", async () => {
    const registration = athleteWithEmail()
    const oldToken = registration.accessToken
    await call("POST", "/inscricoes/acesso/link", { body: { cpf: registration.cpf } })
    const token = tokenOf((await inbox())[0])

    const res = await call("POST", "/inscricoes/acesso", { body: { token } })
    expect(res.status).toBe(200)
    const grant = (await res.json()) as RegistrationAccessGrant
    expect(grant).toEqual({ codigo: registration.codigo, accessToken: expect.any(String), expiraEm: expect.any(String) })
    expect(grant.accessToken).not.toBe(oldToken)

    const withNew = await call("GET", `/inscricoes/${registration.codigo}`, { headers: { Authorization: `Bearer ${grant.accessToken}` } })
    expect(withNew.status).toBe(200)
    const withOld = await call("GET", `/inscricoes/${registration.codigo}`, { headers: { Authorization: `Bearer ${oldToken}` } })
    expect(withOld.status).toBe(401)

    const reused = await call("POST", "/inscricoes/acesso", { body: { token } })
    expect(reused.status).toBe(404)
  })

  it("token inexistente ou vencido → 404 (mesma resposta)", async () => {
    const registration = athleteWithEmail()
    await call("POST", "/inscricoes/acesso/link", { body: { cpf: registration.cpf } })
    const token = tokenOf((await inbox())[0])
    const link = getMockDb().accessLinks.find((item) => item.token === token)
    if (!link) throw new Error("link não gravado")
    link.expiraEm = Date.now() - 1

    const expired = await call("POST", "/inscricoes/acesso", { body: { token } })
    const unknown = await call("POST", "/inscricoes/acesso", { body: { token: "x".repeat(43) } })
    expect([expired.status, unknown.status]).toEqual([404, 404])
    expect(await errorCode(expired)).toBe(await errorCode(unknown))
  })

  it("corpo sem token → 422", async () => {
    const res = await call("POST", "/inscricoes/acesso", { body: {} })
    expect(res.status).toBe(422)
  })
})
