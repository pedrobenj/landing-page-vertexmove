import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"

import { readBearer } from "./mock-auth"
import { getMockDb } from "./mock-db"
import { apiError, type MockContext } from "./mock-http"
import type { MockAdmin } from "./mock-types"

/**
 * Admin do Bearer, ou `Response` 401 `NAO_AUTENTICADO`.
 *
 * Fidelidade: o mock não aplica a matriz de permissões por `papel` (nunca responde 403 `ACESSO_NEGADO`
 * por papel); o backend real responde. A UI esconde as ações por papel e trata o 403 mesmo assim.
 */
export function requireAdmin(ctx: MockContext): MockAdmin | Response {
  const adminId = readBearer(ctx.headers)
  const admin = adminId === null ? undefined : getMockDb().admins.find((item) => item.id === adminId)
  return admin ?? apiError(401, API_ERROR_CODE.NOT_AUTHENTICATED, "Autenticação necessária.")
}

/** Id numérico de `ctx.params[name]`, ou `null`. */
export function paramId(ctx: MockContext, name = "id"): number | null {
  const value = Number(ctx.params[name])
  return Number.isInteger(value) && value > 0 ? value : null
}

export function notFound(entity: string): Response {
  return apiError(404, API_ERROR_CODE.NOT_FOUND, `${entity} não encontrado(a).`)
}

type AdminHandler = (ctx: MockContext, admin: MockAdmin) => Response

/** Exige Bearer antes de chamar o handler. */
export function withAdmin(handler: AdminHandler): (ctx: MockContext) => Response {
  return (ctx) => {
    const admin = requireAdmin(ctx)
    return admin instanceof Response ? admin : handler(ctx, admin)
  }
}

/** 422 `DADO_INVALIDO` para um id que não é inteiro positivo (o backend valida antes de buscar). */
export function invalidId(name: string): Response {
  return apiError(422, API_ERROR_CODE.INVALID_DATA, `${name} deve ser um inteiro positivo.`)
}
