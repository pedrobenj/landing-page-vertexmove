"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"
import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { apiIdSchema } from "@/lib/validations/id.schema"
import { lgpdStatusFormSchema, type LgpdStatusFormInput } from "@/lib/validations/lgpd-status.schema"
import { isApiError } from "@/server/api/api-error"
import { anonymizeLgpdHolder, listAdminLgpdRequests, updateLgpdRequestStatus } from "@/server/api/endpoints/admin-lgpd"
import { requireAdminSession } from "@/server/api/require-admin-session"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { AdminLgpdRequestSummary, LgpdAnonymizationResult } from "@/types/api/lgpd-request.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const LIST_ERROR_TITLE = "Não foi possível carregar as solicitações"
const STATUS_ERROR_TITLE = "Não foi possível alterar a solicitação"
const ANONYMIZE_ERROR_TITLE = "Não foi possível anonimizar"
const STATUS_CONFLICT_MESSAGE = "Esta solicitação já foi encerrada ou mudou de status. Recarregue a página."
const LEGAL_RETENTION_MESSAGE = "O titular ainda está dentro do prazo de retenção legal: os dados não podem ser apagados agora."

const listSchema = z.object({
  status: z.union([z.enum(LGPD_REQUEST_STATUS), z.literal("todos")]),
  tipo: z.union([z.enum(LGPD_REQUEST_TYPE), z.literal("todos")]),
  cursor: z.string().min(1).max(200).nullable(),
})

function revalidateLgpd(id: number) {
  revalidatePath("/admin/lgpd")
  revalidatePath(`/admin/lgpd/${id}`)
}

/** Página da lista de solicitações (filtros e cursor vêm do Zustand). Sem PII. */
export async function listAdminLgpdRequestsAction(
  input: z.input<typeof listSchema>,
): Promise<HttpResponse<CursorPage<AdminLgpdRequestSummary>>> {
  const parsed = listSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(LIST_ERROR_TITLE)
  const { status, tipo, cursor } = parsed.data
  try {
    const data = await listAdminLgpdRequests({
      status: status === "todos" ? undefined : status,
      tipo: tipo === "todos" ? undefined : tipo,
      cursor: cursor ?? undefined,
    })
    return { status: 200, data }
  } catch (error) {
    return toErrorResponse(error, { title: LIST_ERROR_TITLE, context: "listAdminLgpdRequestsAction" })
  }
}

/** `POST /admin/lgpd/solicitacoes/:id/status`: concluída/recusada levam a resposta enviada ao titular. */
export async function updateLgpdRequestStatusAction(id: number, input: LgpdStatusFormInput): Promise<HttpResponse<{ id: number }>> {
  await requireAdminSession()
  if (!apiIdSchema.safeParse(id).success) return invalidInputResponse(STATUS_ERROR_TITLE)
  const parsed = lgpdStatusFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(STATUS_ERROR_TITLE, parsed.error.issues[0])
  try {
    await updateLgpdRequestStatus(id, parsed.data)
    revalidateLgpd(id)
    return { status: 200, data: { id }, title: "Solicitação atualizada" }
  } catch (error) {
    const response = toErrorResponse(error, { title: STATUS_ERROR_TITLE, context: "updateLgpdRequestStatusAction" })
    return response.code === API_ERROR_CODE.STATE_CONFLICT ? { ...response, error: STATUS_CONFLICT_MESSAGE } : response
  }
}

/**
 * `POST /admin/lgpd/solicitacoes/:id/anonimizar` (`{ confirmar: true }`): irreversível, a UI pede confirmação
 * dupla. Recusas do backend (não é eliminação, foi recusada, pagamento pendente) trazem o motivo na mensagem.
 */
export async function anonymizeLgpdHolderAction(id: number): Promise<HttpResponse<LgpdAnonymizationResult>> {
  await requireAdminSession()
  if (!apiIdSchema.safeParse(id).success) return invalidInputResponse(ANONYMIZE_ERROR_TITLE)
  try {
    const data = await anonymizeLgpdHolder(id)
    revalidateLgpd(id)
    return { status: 200, data, title: "Dados anonimizados" }
  } catch (error) {
    const response = toErrorResponse(error, { title: ANONYMIZE_ERROR_TITLE, context: "anonymizeLgpdHolderAction" })
    if (response.code === API_ERROR_CODE.LEGAL_RETENTION) return { ...response, error: LEGAL_RETENTION_MESSAGE }
    if (response.code === API_ERROR_CODE.STATE_CONFLICT && isApiError(error)) return { ...response, error: error.mensagem }
    return response
  }
}
