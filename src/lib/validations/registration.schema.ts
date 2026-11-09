import { differenceInYears, startOfToday } from "date-fns"
import { z } from "zod"

import { countWords } from "@/lib/utils/count-words"
import { isValidBrPhone } from "@/lib/utils/is-valid-br-phone"
import { isValidCpf } from "@/lib/utils/is-valid-cpf"
import { onlyDigits } from "@/lib/utils/only-digits"
import { parseBrDate } from "@/lib/utils/parse-br-date"
import type { PublicEventDetail } from "@/types/api/public-event-detail.interface"

const MAX_AGE_YEARS = 110
const isEmail = (value: string) => z.email().safeParse(value).success

// ---------------------------------------------------------------------------------------------
// Etapa 1 — distância, kit e tamanho. As chaves são as do contrato de `POST /inscricoes`.
// ---------------------------------------------------------------------------------------------

/** Valores do formulário: nada escolhido ainda = `null`. `kitId: null` = "Sem kit". */
export interface DistanceStepValues {
  distanciaId: number | null
  kitId: number | null
  tamanhoCamisaId: number | null
}

/** O tamanho só é obrigatório quando há kit e o evento cadastrou tamanhos. */
export function createDistanceStepSchema(event: Pick<PublicEventDetail, "tamanhosCamisa">) {
  const hasSizes = (event.tamanhosCamisa?.length ?? 0) > 0
  return z
    .object({
      distanciaId: z.number({ error: "Escolha a distância" }).int().positive(),
      kitId: z.number().int().positive().nullable(),
      tamanhoCamisaId: z.number().int().positive().nullable(),
    })
    .superRefine((value, ctx) => {
      if (value.kitId !== null && hasSizes && value.tamanhoCamisaId === null) {
        ctx.addIssue({ code: "custom", path: ["tamanhoCamisaId"], message: "Escolha o tamanho da camisa" })
      }
    })
    .transform((value) => (value.kitId === null ? { ...value, tamanhoCamisaId: null } : value))
}

export type DistanceStepData = z.output<ReturnType<typeof createDistanceStepSchema>>

// ---------------------------------------------------------------------------------------------
// Etapa 2 — dados do atleta. Os valores ficam com máscara (DD/MM/AAAA, 000.000.000-00...);
// a normalização para a API acontece em `toCreateRegistrationInput`.
// ---------------------------------------------------------------------------------------------

export const athleteStepSchema = z
  .object({
    nomeCompleto: z
      .string()
      .trim()
      .refine((value) => countWords(value) >= 2, "Informe nome e sobrenome")
      .refine((value) => value.length <= 150, "Nome muito longo"),
    dataNascimento: z.string().superRefine((value, ctx) => {
      const date = parseBrDate(value)
      const today = startOfToday()
      if (!date) ctx.addIssue({ code: "custom", message: "Data inválida" })
      else if (date >= today) ctx.addIssue({ code: "custom", message: "A data de nascimento precisa estar no passado" })
      else if (differenceInYears(today, date) > MAX_AGE_YEARS) {
        ctx.addIssue({ code: "custom", message: "Confira o ano de nascimento" })
      }
    }),
    cpf: z
      .string()
      .trim()
      .refine((value) => value === "" || isValidCpf(value), "CPF inválido"),
    whatsapp: z
      .string()
      .trim()
      .refine((value) => value === "" || isValidBrPhone(value), "Informe um WhatsApp válido com DDD"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .refine((value) => value === "" || isEmail(value), "E-mail inválido"),
  })
  // `when`: roda mesmo com erro em outros campos, para o atleta ver tudo de uma vez.
  .refine((value) => onlyDigits(value.cpf) !== "" || onlyDigits(value.whatsapp) !== "", {
    message: "Informe o CPF ou o WhatsApp",
    path: ["cpf"],
    when: (payload) => {
      const data = payload.value as Partial<Record<"cpf" | "whatsapp", unknown>>
      return typeof data.cpf === "string" && typeof data.whatsapp === "string"
    },
  })

export type AthleteStepValues = z.input<typeof athleteStepSchema>
export type AthleteStepData = z.output<typeof athleteStepSchema>

// ---------------------------------------------------------------------------------------------
// Etapa 3 — aceites. O regulamento e o termo viram `documentosAceitos` (ids da versão vigente).
// ---------------------------------------------------------------------------------------------

export const termsStepSchema = z.object({
  aceitaRegulamento: z.literal(true, { error: "Aceite o regulamento para continuar" }),
  aceitaTermo: z.literal(true, { error: "Aceite o termo de responsabilidade para continuar" }),
  aceitaPrivacidade: z.literal(true, { error: "Aceite a política de privacidade para continuar" }),
})

/** Valores do formulário: os checkboxes começam desmarcados; o schema só aceita `true`. */
export interface TermsStepValues {
  aceitaRegulamento: boolean
  aceitaTermo: boolean
  aceitaPrivacidade: boolean
}

export type TermsStepData = z.output<typeof termsStepSchema>

// ---------------------------------------------------------------------------------------------
// Espelho do contrato de `POST /inscricoes` — validado na server action antes de chamar a API.
// ---------------------------------------------------------------------------------------------

const positiveId = z.number().int().positive()

export const createRegistrationInputSchema = z
  .object({
    eventoSlug: z.string().min(1).max(200),
    distanciaId: positiveId,
    kitId: positiveId.optional(),
    tamanhoCamisaId: positiveId.optional(),
    nomeCompleto: z.string().trim().min(3).max(150),
    dataNascimento: z.iso.date(),
    cpf: z.string().regex(/^\d{11}$/).refine(isValidCpf).optional(),
    whatsapp: z
      .string()
      .regex(/^\+55\d{10,11}$/)
      .optional(),
    email: z.email().max(254).optional(),
    documentosAceitos: z.array(positiveId).max(20),
  })
  .strict()
  .refine((input) => input.cpf !== undefined || input.whatsapp !== undefined, {
    message: "Informe o CPF ou o WhatsApp",
    path: ["cpf"],
  })
