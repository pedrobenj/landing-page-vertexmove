"use server"

import { redirect } from "next/navigation"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { getApiErrorMessage } from "@/lib/utils/api-errors"
import { ADMIN_LOGIN_PATH, ADMIN_PASSWORD_CHANGED_PARAM } from "@/lib/utils/constants"
import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { getPasswordRuleMessage } from "@/lib/utils/password-rule-message"
import { apiIdSchema } from "@/lib/validations/id.schema"
import {
  changeOwnPasswordFormSchema,
  type ChangeOwnPasswordFormInput,
  managedAdminFormSchema,
  type ManagedAdminFormInput,
} from "@/lib/validations/managed-admin.schema"
import { isApiError } from "@/server/api/api-error"
import { clearSession } from "@/server/api/admin-session"
import {
  changeOwnPassword,
  createManagedAdmin,
  deactivateManagedAdmin,
  reactivateManagedAdmin,
  resetManagedAdminPassword,
} from "@/server/api/endpoints/admin-management"
import { ensureCanManageEvents } from "@/server/api/ensure-can-manage-events"
import { getAdminSessionAllowingPasswordChange } from "@/server/api/require-admin-session"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { CreatedManagedAdmin, ManagedAdmin, TemporaryPassword } from "@/types/api/managed-admin.interface"
import type { HttpResponse } from "@/types/http-response.interface"

/*
 * Gestão de admins (`/admin/admins`, fase 8). Papel único `admin` no backend (ADR-008): a UI segue a
 * mesma matriz das corridas e o backend decide. A senha temporária volta para o client UMA vez, para ser
 * mostrada e copiada; nunca é logada nem guardada.
 */

const CREATE_ERROR_TITLE = "Não foi possível criar o admin"
const STATUS_ERROR_TITLE = "Não foi possível alterar o admin"
const RESET_ERROR_TITLE = "Não foi possível redefinir a senha"
const PASSWORD_ERROR_TITLE = "Não foi possível trocar a senha"

/** `POST /admin/admins` */
export async function createAdminAction(input: ManagedAdminFormInput): Promise<HttpResponse<CreatedManagedAdmin>> {
  const denied = await ensureCanManageEvents(CREATE_ERROR_TITLE, "createAdminAction")
  if (denied) return denied

  const parsed = managedAdminFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(CREATE_ERROR_TITLE, parsed.error.issues[0])

  try {
    const data = await createManagedAdmin(parsed.data)
    return { status: 201, data, title: "Admin criado" }
  } catch (error) {
    return toErrorResponse(error, {
      title: CREATE_ERROR_TITLE,
      context: "createAdminAction",
      fieldByCode: { [API_ERROR_CODE.ADMIN_EMAIL_IN_USE]: "email" },
    })
  }
}

async function runOnAdmin<T>(
  id: number,
  title: string,
  context: string,
  call: (id: number) => Promise<T>,
  successTitle: string,
): Promise<HttpResponse<T>> {
  const denied = await ensureCanManageEvents(title, context)
  if (denied) return denied
  if (!apiIdSchema.safeParse(id).success) return invalidInputResponse(title)
  try {
    return { status: 200, data: await call(id), title: successTitle }
  } catch (error) {
    return toErrorResponse(error, { title, context })
  }
}

/** `POST /admin/admins/:id/desativar` (revoga as sessões do alvo). */
export async function deactivateAdminAction(id: number): Promise<HttpResponse<ManagedAdmin>> {
  return runOnAdmin(id, STATUS_ERROR_TITLE, "deactivateAdminAction", deactivateManagedAdmin, "Admin desativado")
}

/** `POST /admin/admins/:id/reativar` */
export async function reactivateAdminAction(id: number): Promise<HttpResponse<ManagedAdmin>> {
  return runOnAdmin(id, STATUS_ERROR_TITLE, "reactivateAdminAction", reactivateManagedAdmin, "Admin reativado")
}

/** `POST /admin/admins/:id/redefinir-senha`: nova senha temporária, mostrada uma vez. */
export async function resetAdminPasswordAction(id: number): Promise<HttpResponse<TemporaryPassword>> {
  return runOnAdmin(id, RESET_ERROR_TITLE, "resetAdminPasswordAction", resetManagedAdminPassword, "Senha redefinida")
}

/**
 * `POST /admin/me/senha`. O 204 revoga TODAS as sessões do admin, inclusive esta: limpa os cookies e
 * leva ao login com o aviso (o `redirect` fica fora do try/catch).
 */
export async function changeOwnPasswordAction(input: ChangeOwnPasswordFormInput): Promise<HttpResponse> {
  // A senha temporária só libera esta troca (e o `/admin/me`): sessão permissiva.
  await getAdminSessionAllowingPasswordChange()

  const parsed = changeOwnPasswordFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(PASSWORD_ERROR_TITLE, parsed.error.issues[0])

  try {
    await changeOwnPassword(parsed.data)
  } catch (error) {
    if (isApiError(error) && error.codigo === API_ERROR_CODE.WRONG_CURRENT_PASSWORD) {
      return { status: error.status, code: error.codigo, error: getApiErrorMessage(error.codigo), title: PASSWORD_ERROR_TITLE, field: "senhaAtual" }
    }
    const ruleMessage = isApiError(error) && error.status === 422 ? getPasswordRuleMessage(error.regra) : null
    if (isApiError(error) && ruleMessage) {
      return { status: error.status, code: error.codigo, error: ruleMessage, title: PASSWORD_ERROR_TITLE, field: "novaSenha" }
    }
    return toErrorResponse(error, { title: PASSWORD_ERROR_TITLE, context: "changeOwnPasswordAction" })
  }

  await clearSession()
  redirect(`${ADMIN_LOGIN_PATH}?${ADMIN_PASSWORD_CHANGED_PARAM}=1`)
}
