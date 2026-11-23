import { z } from "zod"

import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"
import { countWords } from "@/lib/utils/count-words"
import { isValidBrPhone } from "@/lib/utils/is-valid-br-phone"
import { isValidCpf } from "@/lib/utils/is-valid-cpf"
import { normalizeCpf } from "@/lib/utils/normalize-cpf"
import { normalizeName } from "@/lib/utils/normalize-name"
import { toE164Phone } from "@/lib/utils/to-e164-phone"

export const LGPD_MESSAGE_MAX_LENGTH = 2000
const isEmail = (value: string) => z.email().safeParse(value).success

/**
 * Solicitação do titular (`/privacidade/solicitacao`). A saída é o corpo de `POST /lgpd/solicitacoes`:
 * o aceite só libera o envio e não vai à API.
 */
export const lgpdRequestSchema = z
  .object({
    tipo: z.enum(LGPD_REQUEST_TYPE, { error: "Escolha o tipo de solicitação" }),
    nomeCompleto: z
      .string()
      .trim()
      .refine((value) => countWords(value) >= 2, "Informe o nome completo")
      .refine((value) => value.length <= 120, "Nome muito longo")
      .transform(normalizeName),
    cpf: z
      .string()
      .trim()
      .refine((value) => isValidCpf(value), "CPF inválido")
      .transform(normalizeCpf),
    email: z
      .string()
      .trim()
      .max(254, "E-mail muito longo")
      .refine((value) => value === "" || isEmail(value), "E-mail inválido")
      .transform((value) => value.toLowerCase() || null),
    whatsapp: z
      .string()
      .trim()
      .refine((value) => value === "" || isValidBrPhone(value), "Informe um WhatsApp válido com DDD")
      .transform((value) => (value === "" ? null : toE164Phone(value))),
    mensagem: z
      .string()
      .trim()
      .max(LGPD_MESSAGE_MAX_LENGTH, `No máximo ${LGPD_MESSAGE_MAX_LENGTH} caracteres`)
      .transform((value) => value || null),
    aceite: z.boolean().refine(Boolean, "Confirme que você é o titular dos dados ou o representante legal dele"),
  })
  // `when`: roda mesmo com erro em outros campos, para mostrar tudo de uma vez. Campos com erro chegam
  // sem o transform (string crua), por isso compara com vazio e com null.
  .refine((value) => Boolean(value.email) || Boolean(value.whatsapp), {
    path: ["email"],
    message: "Informe um e-mail ou um WhatsApp para a resposta",
    when: () => true,
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- o aceite não faz parte do corpo da API
  .transform(({ aceite, ...body }) => body)

export type LgpdRequestFormInput = z.input<typeof lgpdRequestSchema>
export type LgpdRequestFormData = z.output<typeof lgpdRequestSchema>
