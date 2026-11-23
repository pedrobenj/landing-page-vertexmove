import { z } from "zod"

import { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"

export const LGPD_ANSWER_MAX_LENGTH = 4000
const ANSWER_REQUIRED: readonly LGPD_REQUEST_STATUS[] = [LGPD_REQUEST_STATUS.FULFILLED, LGPD_REQUEST_STATUS.REJECTED]

/** Mudança de status no admin = corpo de `POST /admin/lgpd/solicitacoes/:id/status`. */
export const lgpdStatusFormSchema = z
  .object({
    status: z.enum(LGPD_REQUEST_STATUS, { error: "Escolha o novo status" }),
    resposta: z
      .string()
      .nullable()
      .transform((value) => value?.trim() || null)
      .refine((value) => value === null || value.length <= LGPD_ANSWER_MAX_LENGTH, `No máximo ${LGPD_ANSWER_MAX_LENGTH} caracteres`),
  })
  .refine((value) => !ANSWER_REQUIRED.includes(value.status) || value.resposta !== null, {
    path: ["resposta"],
    message: "Escreva a resposta enviada ao titular",
  })

export type LgpdStatusFormInput = z.input<typeof lgpdStatusFormSchema>
export type LgpdStatusFormData = z.output<typeof lgpdStatusFormSchema>
