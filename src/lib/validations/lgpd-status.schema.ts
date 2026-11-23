import { z } from "zod"

import { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import type { LgpdRequestStatusInput } from "@/types/api/lgpd-request.interface"

export const LGPD_ANSWER_MAX_LENGTH = 4000
const ANSWER_REQUIRED: readonly LGPD_REQUEST_STATUS[] = [LGPD_REQUEST_STATUS.FULFILLED, LGPD_REQUEST_STATUS.REJECTED]

/**
 * Atendimento no admin = corpo de `PATCH /admin/lgpd/solicitacoes/:id`. Resposta vazia sai do corpo (o
 * backend mantém a anterior); concluída e recusada exigem a resposta enviada ao titular.
 */
export const lgpdStatusFormSchema = z
  .object({
    status: z.enum(LGPD_REQUEST_STATUS, { error: "Escolha o novo status" }),
    resposta: z
      .string()
      .nullable()
      .transform((value) => value?.trim() ?? "")
      .refine((value) => value.length <= LGPD_ANSWER_MAX_LENGTH, `No máximo ${LGPD_ANSWER_MAX_LENGTH} caracteres`),
  })
  .refine((value) => !ANSWER_REQUIRED.includes(value.status) || value.resposta !== "", {
    path: ["resposta"],
    message: "Escreva a resposta enviada ao titular",
  })
  .transform(({ status, resposta }): LgpdRequestStatusInput => ({ status, ...(resposta && { resposta }) }))

export type LgpdStatusFormInput = z.input<typeof lgpdStatusFormSchema>
export type LgpdStatusFormData = z.output<typeof lgpdStatusFormSchema>
