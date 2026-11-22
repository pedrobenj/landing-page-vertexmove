import { isValid, parse } from "date-fns"
import { z } from "zod"

import { intField, optionalTextField } from "./form-fields"

const API_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const UF_PATTERN = /^[A-Z]{2}$/
const HTTPS_MESSAGE = "Informe um link https://"
const MAX_DISTANCES = 10
const MAX_DISTANCE_LENGTH = 20

const isApiDate = (value: string) =>
  API_DATE_PATTERN.test(value) && isValid(parse(value, "yyyy-MM-dd", new Date(2000, 0, 1)))
/** Só https: o backend recusa http e esquemas como `javascript:` nos links externos. */
const isHttpsUrl = (value: string) => z.url({ protocol: /^https$/ }).max(2048).safeParse(value).success

const requiredText = (message: string, max: number) =>
  z.string().trim().min(1, message).max(max, `No máximo ${max} caracteres`)

/** `"5 km, 10 km"` → `["5 km", "10 km"]` (vazios descartados). */
const distancesField = z
  .string()
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  )
  .refine((items) => items.length <= MAX_DISTANCES, `No máximo ${MAX_DISTANCES} distâncias`)
  .refine((items) => items.every((item) => item.length <= MAX_DISTANCE_LENGTH), `Cada distância com até ${MAX_DISTANCE_LENGTH} caracteres`)

/**
 * Corrida parceira. Saída = corpo de `POST /admin/corridas-parceiras` (objeto estrito no backend: só estas
 * chaves). O `PATCH` reaproveita o corpo inteiro.
 */
export const partnerRaceFormSchema = z.object({
  nome: requiredText("Informe o nome da corrida", 160),
  dataEvento: z.string().trim().refine(isApiDate, "Informe a data da corrida"),
  localNome: requiredText("Informe o local", 160),
  cidade: requiredText("Informe a cidade", 80),
  uf: z.string().trim().toUpperCase().regex(UF_PATTERN, "UF com 2 letras (ex.: CE)"),
  distancias: distancesField,
  cupom: requiredText("Informe o cupom", 40),
  descontoPercentual: intField("Desconto entre 1% e 100%", { min: 1, max: 100 }),
  realizacao: optionalTextField.refine((value) => value === null || value.length <= 160, "No máximo 160 caracteres"),
  urlInscricao: z.string().trim().refine(isHttpsUrl, HTTPS_MESSAGE),
  imagemCapaUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || isHttpsUrl(value), HTTPS_MESSAGE)
    .transform((value) => value || null),
  ordem: intField("Ordem deve ser um número inteiro entre 0 e 32767", { max: 32_767 }),
  ativo: z.boolean(),
})

export type PartnerRaceFormInput = z.input<typeof partnerRaceFormSchema>
export type PartnerRaceFormData = z.output<typeof partnerRaceFormSchema>
