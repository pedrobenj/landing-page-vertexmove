"use server"

import { updateTag } from "next/cache"

import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { apiIdSchema } from "@/lib/validations/id.schema"
import { partnerRaceFormSchema, type PartnerRaceFormInput } from "@/lib/validations/partner-race.schema"
import { createPartnerRace, deletePartnerRace, updatePartnerRace } from "@/server/api/endpoints/admin-partner-races"
import { PARTNER_RACES_TAG } from "@/server/api/endpoints/partner-races"
import { ensureCanManageEvents } from "@/server/api/ensure-can-manage-events"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { HttpResponse } from "@/types/http-response.interface"

const SAVE_ERROR_TITLE = "Não foi possível salvar a corrida parceira"
const STATUS_ERROR_TITLE = "Não foi possível alterar a corrida parceira"
const DELETE_ERROR_TITLE = "Não foi possível excluir a corrida parceira"

/*
 * Corridas parceiras aparecem na home e em `/corridas-parceiras` (tag `partner-races`). `updateTag`
 * (read-your-own-writes): a próxima visita já traz a mudança. A permissão segue a das corridas (papel
 * único `admin` no backend, ADR-008); o backend decide e o 403 vira `HttpResponse`.
 */

/** `POST /admin/corridas-parceiras` (sem `id`) ou `PATCH /admin/corridas-parceiras/:id` com o corpo inteiro. */
export async function savePartnerRaceAction(input: PartnerRaceFormInput, id?: number): Promise<HttpResponse<{ id: number }>> {
  const denied = await ensureCanManageEvents(SAVE_ERROR_TITLE, "savePartnerRaceAction")
  if (denied) return denied

  if (id !== undefined && !apiIdSchema.safeParse(id).success) return invalidInputResponse("Corrida parceira inválida")
  const parsed = partnerRaceFormSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(SAVE_ERROR_TITLE, parsed.error.issues[0])

  try {
    const race = id === undefined ? await createPartnerRace(parsed.data) : await updatePartnerRace(id, parsed.data)
    updateTag(PARTNER_RACES_TAG)
    return {
      status: id === undefined ? 201 : 200,
      data: { id: race.id },
      title: id === undefined ? "Corrida parceira cadastrada" : "Corrida parceira atualizada",
    }
  } catch (error) {
    return toErrorResponse(error, { title: SAVE_ERROR_TITLE, context: "savePartnerRaceAction" })
  }
}

/** Ativar/desativar na lista: `PATCH { ativo }` (inativa some do site, mas continua no admin). */
export async function setPartnerRaceActiveAction(id: number, ativo: boolean): Promise<HttpResponse<{ id: number }>> {
  const denied = await ensureCanManageEvents(STATUS_ERROR_TITLE, "setPartnerRaceActiveAction")
  if (denied) return denied

  if (!apiIdSchema.safeParse(id).success || typeof ativo !== "boolean") return invalidInputResponse(STATUS_ERROR_TITLE)

  try {
    const race = await updatePartnerRace(id, { ativo })
    updateTag(PARTNER_RACES_TAG)
    return { status: 200, data: { id: race.id }, title: ativo ? "Corrida parceira ativada" : "Corrida parceira desativada" }
  } catch (error) {
    return toErrorResponse(error, { title: STATUS_ERROR_TITLE, context: "setPartnerRaceActiveAction" })
  }
}

/** `DELETE /admin/corridas-parceiras/:id`: exclusão física (para só ocultar, desative). */
export async function deletePartnerRaceAction(id: number): Promise<HttpResponse> {
  const denied = await ensureCanManageEvents(DELETE_ERROR_TITLE, "deletePartnerRaceAction")
  if (denied) return denied

  if (!apiIdSchema.safeParse(id).success) return invalidInputResponse(DELETE_ERROR_TITLE)

  try {
    await deletePartnerRace(id)
    updateTag(PARTNER_RACES_TAG)
    return { status: 204, title: "Corrida parceira excluída" }
  } catch (error) {
    return toErrorResponse(error, { title: DELETE_ERROR_TITLE, context: "deletePartnerRaceAction" })
  }
}
