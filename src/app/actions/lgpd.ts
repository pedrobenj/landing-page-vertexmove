"use server"

import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { lgpdRequestSchema, type LgpdRequestFormInput } from "@/lib/validations/lgpd-request.schema"
import { createLgpdRequest } from "@/server/api/endpoints/lgpd"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { LgpdRequestReceipt } from "@/types/api/lgpd-request.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const ERROR_TITLE = "Não foi possível enviar a solicitação"

/**
 * Solicitação do titular (`POST /lgpd/solicitacoes`). A resposta é a mesma exista ou não o titular:
 * a tela mostra só o protocolo e o prazo, sem dizer se o CPF tem cadastro.
 */
export async function createLgpdRequestAction(input: LgpdRequestFormInput): Promise<HttpResponse<LgpdRequestReceipt>> {
  const parsed = lgpdRequestSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(ERROR_TITLE, parsed.error.issues[0])

  try {
    const receipt = await createLgpdRequest(parsed.data)
    return { status: 202, data: { protocolo: receipt.protocolo, prazoEm: receipt.prazoEm }, title: "Solicitação enviada" }
  } catch (error) {
    return toErrorResponse(error, { title: ERROR_TITLE, context: "createLgpdRequestAction" })
  }
}
