import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"

import { readBearer } from "./mock-auth"
import { getMockDb } from "./mock-db"
import { apiError, type MockContext } from "./mock-http"
import type { MockAdmin } from "./mock-types"

/** Admin do Bearer, ou `Response` 401 `NAO_AUTENTICADO`. */
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
