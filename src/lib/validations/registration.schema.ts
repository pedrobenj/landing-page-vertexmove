import { differenceInYears, startOfToday } from "date-fns"
import { z } from "zod"

import { countWords } from "@/lib/utils/count-words"
import { isValidBrPhone } from "@/lib/utils/is-valid-br-phone"
import { isMinorOnDate } from "@/lib/utils/is-minor-on-date"
import { isValidCpf } from "@/lib/utils/is-valid-cpf"
import { onlyDigits } from "@/lib/utils/only-digits"
import { parseBrDate } from "@/lib/utils/parse-br-date"
import type { PublicKit } from "@/types/api/public-event-detail.interface"
import type { ShirtSize } from "@/types/api/shirt-size.interface"

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

interface DistanceStepEvent {
  kits?: ReadonlyArray<Pick<PublicKit, "id">>
  tamanhosCamisa?: ReadonlyArray<Pick<ShirtSize, "id">>
}

/**
 * O tamanho só é obrigatório quando há kit e o evento cadastrou tamanhos. Kit e tamanho precisam
 * existir no evento — o rascunho do sessionStorage pode ser de antes de uma mudança no cadastro.
 */
export function createDistanceStepSchema(event: DistanceStepEvent) {
  const kitIds = new Set(event.kits?.map((kit) => kit.id))
  const sizeIds = new Set(event.tamanhosCamisa?.map((size) => size.id))
  const hasSizes = sizeIds.size > 0
  return z
    .object({
      distanciaId: z.number({ error: "Escolha a distância" }).int().positive(),
      kitId: z.number().int().positive().nullable(),
      tamanhoCamisaId: z.number().int().positive().nullable(),
    })
    .superRefine((value, ctx) => {
      if (value.kitId === null) return
      if (!kitIds.has(value.kitId)) {
        ctx.addIssue({ code: "custom", path: ["kitId"], message: "Escolha um kit disponível" })
        return
      }
      if (!hasSizes) return
      if (value.tamanhoCamisaId === null) {
        ctx.addIssue({ code: "custom", path: ["tamanhoCamisaId"], message: "Escolha o tamanho da camisa" })
      } else if (!sizeIds.has(value.tamanhoCamisaId)) {
        ctx.addIssue({ code: "custom", path: ["tamanhoCamisaId"], message: "Escolha um tamanho disponível" })
      }
    })
    .transform((value) => (value.kitId === null ? { ...value, tamanhoCamisaId: null } : value))
}

export type DistanceStepData = z.output<ReturnType<typeof createDistanceStepSchema>>

// ---------------------------------------------------------------------------------------------
// Etapa 2 — dados do atleta. Os valores ficam com máscara (DD/MM/AAAA, 000.000.000-00...);
// a normalização para a API acontece em `toCreateRegistrationInput`.
// ---------------------------------------------------------------------------------------------

/** `when` dos refinamentos do objeto: rodam mesmo com erro em outros campos (o atleta vê tudo de uma vez). */
function hasStringFields(...keys: string[]) {
  return (payload: { value: unknown }) => {
    const data = payload.value as Record<string, unknown>
    return keys.every((key) => typeof data[key] === "string")
  }
}

/**
 * `eventDate` (`YYYY-MM-DD`): a idade é calculada na data da prova. Atleta menor de 18 exige
 * `responsavelLegal: true` — confirmação só do formulário; NÃO vai para a API (o contrato não tem o
 * campo, ver §16 do CLAUDE.md), por isso `toCreateRegistrationInput` não o envia.
 */
export function createAthleteStepSchema(eventDate: string) {
  return z
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
      responsavelLegal: z.boolean().optional(),
    })
    .refine((value) => onlyDigits(value.cpf) !== "" || onlyDigits(value.whatsapp) !== "", {
      message: "Informe o CPF ou o WhatsApp",
      path: ["cpf"],
      when: hasStringFields("cpf", "whatsapp"),
    })
    .refine((value) => value.responsavelLegal === true || !isMinorOnDate(value.dataNascimento, eventDate), {
      message: "Confirme que você é o responsável legal ou tem autorização dele",
      path: ["responsavelLegal"],
      when: hasStringFields("dataNascimento"),
    })
}

export type AthleteStepValues = z.input<ReturnType<typeof createAthleteStepSchema>>
export type AthleteStepData = z.output<ReturnType<typeof createAthleteStepSchema>>

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
