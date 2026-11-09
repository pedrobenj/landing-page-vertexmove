import { isValid, parse } from "date-fns"
import { z } from "zod"

import { onlyDigits } from "@/lib/utils/only-digits"

import { REQUIRED_MESSAGE } from "./messages"

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const API_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const API_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
const UF_PATTERN = /^[A-Z]{2}$/
const CEP_LENGTH = 8

const isApiDate = (value: string) =>
  API_DATE_PATTERN.test(value) && isValid(parse(value, "yyyy-MM-dd", new Date(2000, 0, 1)))
const isHttpUrl = (value: string) => z.url({ protocol: /^https?$/ }).safeParse(value).success

const requiredText = (message = REQUIRED_MESSAGE) => z.string().trim().min(1, message)

/** Texto opcional: vazio vira `null` (a API aceita `null` nesses campos). */
const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null)

/** URL http(s) opcional: vazio vira `null`. */
const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || isHttpUrl(value), "Informe uma URL válida, começando com https://")
  .transform((value) => value || null)

/** Coordenada opcional digitada como texto (aceita vírgula decimal). Vazio vira `null`. */
function optionalCoordinate(limit: number, label: string) {
  return z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (value === "") return null
      const number = Number(value.replace(",", "."))
      if (!Number.isFinite(number) || Math.abs(number) > limit) {
        ctx.addIssue({ code: "custom", message: `${label} deve ser um número entre -${limit} e ${limit}` })
        return z.NEVER
      }
      return number
    })
}

/**
 * Formulário de corrida do admin. Chaves iguais às de `POST/PATCH /admin/eventos`; os valores do form são
 * todos texto (inputs) e a saída já vem no formato da API: datas `YYYY-MM-DD`, horário `HH:mm`, CEP só
 * dígitos, coordenadas numéricas e opcionais em `null`.
 */
export const adminEventFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Informe o endereço (slug)")
    .max(120, "Slug com no máximo 120 caracteres")
    .regex(SLUG_PATTERN, "Use só letras minúsculas, números e hífens (ex.: corrida-do-sol-2026)"),
  nome: z.string().trim().min(3, "Informe o nome da corrida").max(150, "Nome com no máximo 150 caracteres"),
  descricao: requiredText("Descreva a corrida"),
  dataEvento: z.string().trim().refine(isApiDate, "Informe a data da corrida"),
  horarioLargada: z.string().trim().regex(API_TIME_PATTERN, "Informe o horário de largada"),
  localNome: requiredText("Informe o local da largada"),
  endereco: optionalText,
  complemento: optionalText,
  bairro: optionalText,
  cidade: requiredText("Informe a cidade"),
  uf: z.string().trim().toUpperCase().regex(UF_PATTERN, "UF com 2 letras (ex.: CE)"),
  cep: z
    .string()
    .transform(onlyDigits)
    .refine((value) => value === "" || value.length === CEP_LENGTH, "CEP deve ter 8 dígitos")
    .transform((value) => value || null),
  latitude: optionalCoordinate(90, "Latitude"),
  longitude: optionalCoordinate(180, "Longitude"),
  imagemCapaUrl: optionalUrl,
  galeriaUrl: optionalUrl,
})

export type AdminEventFormInput = z.input<typeof adminEventFormSchema>
export type AdminEventFormData = z.output<typeof adminEventFormSchema>
