import "server-only"

import { randomBytes } from "node:crypto"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import type { ManagedAdmin } from "@/types/api/managed-admin.interface"

import { getMockDb, nextId, recordAudit } from "../mock-db"
import { invalidId, notFound, paramId, withAdmin } from "../mock-guards"
import { apiError, created, json, type MockContext, type MockRoute, noContent } from "../mock-http"
import { changePasswordSchema, managedAdminSchema, validate } from "../mock-schemas"
import type { MockAdmin } from "../mock-types"

/** `ADMIN_PASSWORD_MIN_LENGTH` padrão do backend e `SENHA_TAMANHO_MAXIMO`. */
const PASSWORD_MIN_LENGTH = 12
const PASSWORD_MAX_LENGTH = 128
/** `SENHAS_OBVIAS` de `politica-senha.ts`. */
const OBVIOUS_PASSWORDS: ReadonlySet<string> = new Set([
  "password", "password123", "senha", "senha123", "admin", "admin123", "administrador", "qwerty", "qwerty123",
  "123456", "12345678", "123456789", "1234567890", "letmein", "changeme", "trocar123", "vertex", "vertexmove",
  "troque-esta-senha",
])

/** 18 bytes → 24 caracteres base64url, como o backend. */
function temporaryPassword(): string {
  return randomBytes(18).toString("base64url")
}

function toManagedAdmin(admin: MockAdmin): ManagedAdmin {
  return {
    id: admin.id,
    nome: admin.nome,
    email: admin.email,
    papel: admin.papel,
    ativo: admin.ativo,
    ultimoAcessoEm: admin.ultimoAcessoEm,
    criadoEm: admin.criadoEm,
  }
}

function findTarget(ctx: MockContext): MockAdmin | Response {
  const id = paramId(ctx)
  if (id === null) return invalidId("id")
  return getMockDb().admins.find((admin) => admin.id === id) ?? notFound("Admin")
}

function ownAccount(): Response {
  return apiError(409, API_ERROR_CODE.OWN_ADMIN_OPERATION, "Esta operação não pode ser feita na sua própria conta.")
}

function passwordRule(password: string): string | null {
  const length = Array.from(password).length
  if (length < PASSWORD_MIN_LENGTH) return "tamanho_minimo"
  if (length > PASSWORD_MAX_LENGTH) return "tamanho_maximo"
  if (OBVIOUS_PASSWORDS.has(password.trim().toLowerCase())) return "senha_obvia"
  return null
}

function invalidPassword(regra: string): Response {
  return json(422, {
    error: { codigo: API_ERROR_CODE.INVALID_DATA, mensagem: "Os dados informados são inválidos.", detalhes: [{ campo: "novaSenha", regra }] },
  })
}

/*
 * Fidelidade: os tokens do mock não têm estado. Desativar barra o login e os tokens do alvo (o mock
 * confere `ativo` em cada request); redefinir/trocar senha NÃO revoga as sessões abertas no mock (no
 * backend, revoga). A troca da própria senha limpa a sessão no BFF de qualquer jeito.
 */
export const adminManagementRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/admin/admins",
    handler: withAdmin(() =>
      json(200, [...getMockDb().admins].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")).map(toManagedAdmin)),
    ),
  },
  {
    method: "POST",
    path: "/admin/admins",
    handler: withAdmin((ctx, actor) => {
      const input = validate(managedAdminSchema, ctx.body)
      if (input instanceof Response) return input
      const db = getMockDb()
      if (db.admins.some((admin) => admin.email === input.email)) {
        return apiError(409, API_ERROR_CODE.ADMIN_EMAIL_IN_USE, "Já existe um admin com este e-mail.")
      }
      const senhaTemporaria = temporaryPassword()
      const admin: MockAdmin = {
        id: nextId(db.admins),
        ...input,
        senha: senhaTemporaria,
        senhaTemporaria: true,
        papel: ADMIN_ROLE.ADMIN,
        mfaAtivo: false,
        ativo: true,
        ultimoAcessoEm: null,
        criadoEm: new Date().toISOString(),
      }
      db.admins.push(admin)
      recordAudit(actor, { acao: "criar", entidade: "admin", entidadeId: admin.id })
      return created({ admin: toManagedAdmin(admin), senhaTemporaria }, `/admin/admins/${admin.id}`)
    }),
  },
  {
    method: "POST",
    path: "/admin/admins/:id/desativar",
    handler: withAdmin((ctx, actor) => {
      const target = findTarget(ctx)
      if (target instanceof Response) return target
      if (target.id === actor.id) return ownAccount()
      const othersActive = getMockDb().admins.filter((admin) => admin.ativo && admin.id !== target.id).length
      if (target.ativo && othersActive === 0) {
        return apiError(409, API_ERROR_CODE.LAST_ACTIVE_ADMIN, "Não é possível desativar o último admin ativo.")
      }
      target.ativo = false
      recordAudit(actor, { acao: "atualizar", entidade: "admin", entidadeId: target.id })
      return json(200, toManagedAdmin(target))
    }),
  },
  {
    method: "POST",
    path: "/admin/admins/:id/reativar",
    handler: withAdmin((ctx, actor) => {
      const target = findTarget(ctx)
      if (target instanceof Response) return target
      target.ativo = true
      recordAudit(actor, { acao: "atualizar", entidade: "admin", entidadeId: target.id })
      return json(200, toManagedAdmin(target))
    }),
  },
  {
    method: "POST",
    path: "/admin/admins/:id/redefinir-senha",
    handler: withAdmin((ctx, actor) => {
      const target = findTarget(ctx)
      if (target instanceof Response) return target
      if (target.id === actor.id) return ownAccount()
      const senhaTemporaria = temporaryPassword()
      target.senha = senhaTemporaria
      target.senhaTemporaria = true
      recordAudit(actor, { acao: "atualizar", entidade: "admin", entidadeId: target.id })
      return json(200, { senhaTemporaria })
    }),
  },
  {
    method: "POST",
    path: "/admin/me/senha",
    handler: withAdmin((ctx, actor) => {
      const input = validate(changePasswordSchema, ctx.body)
      if (input instanceof Response) {
        // Corpo com `novaSenha` acima de 128 cai na regra, como no serviço do backend.
        const body = ctx.body as { novaSenha?: unknown } | null
        if (typeof body?.novaSenha === "string" && body.novaSenha.length > PASSWORD_MAX_LENGTH) return invalidPassword("tamanho_maximo")
        return input
      }
      const rule = passwordRule(input.novaSenha)
      if (rule) return invalidPassword(rule)
      if (input.novaSenha === input.senhaAtual) return invalidPassword("igual_a_atual")
      if (input.senhaAtual !== actor.senha) {
        return apiError(422, API_ERROR_CODE.WRONG_CURRENT_PASSWORD, "A senha atual não confere.")
      }
      actor.senha = input.novaSenha
      actor.senhaTemporaria = false
      recordAudit(actor, { acao: "atualizar", entidade: "admin", entidadeId: actor.id })
      return noContent()
    }, { allowTemporaryPassword: true }),
  },
]
