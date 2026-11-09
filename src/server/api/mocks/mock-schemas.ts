import "server-only"

import { z } from "zod"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import { isValidCpf } from "@/lib/utils/is-valid-cpf"

import { apiError } from "./mock-http"

/** Validações que o backend faria. Falha → 422 `DADO_INVALIDO` com a primeira mensagem. */
export function validate<T>(schema: z.ZodType<T>, body: unknown): T | Response {
  const result = schema.safeParse(body)
  if (result.success) return result.data
  const issue = result.error.issues[0]
  const field = issue?.path.join(".")
  return apiError(422, API_ERROR_CODE.INVALID_DATA, field ? `${field}: ${issue.message}` : (issue?.message ?? "Dados inválidos."))
}

/**
 * PATCH: valida só os campos enviados. No Zod 4, `.partial()` ainda aplica `.default()`,
 * então os campos ausentes no corpo são descartados depois do parse.
 */
export function validatePatch<T extends z.ZodRawShape>(schema: z.ZodObject<T>, body: unknown): Record<string, unknown> | Response {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return apiError(422, API_ERROR_CODE.INVALID_DATA, "Corpo deve ser um objeto JSON.")
  }
  const parsed = validate(schema.partial(), body)
  if (parsed instanceof Response) return parsed
  const sent = new Set(Object.keys(body))
  return Object.fromEntries(Object.entries(parsed as Record<string, unknown>).filter(([key]) => sent.has(key)))
}

const id = z.number().int().positive()
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário deve estar no formato HH:mm.")
const cpf = z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos.").refine(isValidCpf, "CPF inválido.")
const e164 = z.string().regex(/^\+55\d{10,11}$/, "WhatsApp deve estar em E.164 (+55DDDNÚMERO).")
const isoInstant = z.iso.datetime({ offset: true })

export const createRegistrationSchema = z
  .object({
    eventoSlug: z.string().min(1),
    distanciaId: id,
    kitId: id.nullish(),
    tamanhoCamisaId: id.nullish(),
    nomeCompleto: z.string().trim().min(3).max(150),
    dataNascimento: z.iso.date().refine((value) => value < new Date().toISOString().slice(0, 10), "Data no futuro."),
    cpf: cpf.nullish(),
    whatsapp: e164.nullish(),
    email: z.email().nullish(),
    documentosAceitos: z.array(z.number().int()).default([]),
  })
  .refine((input) => input.cpf || input.whatsapp, { message: "Informe CPF ou WhatsApp.", path: ["cpf"] })

export const lookupSchema = z.union([
  z.strictObject({ cpf }),
  z.strictObject({ whatsapp: e164 }),
])

export const loginSchema = z.object({ email: z.string().min(1), senha: z.string().min(1) })

const nullableText = z.string().trim().min(1).nullable()

export const adminEventSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido."),
  nome: z.string().trim().min(3).max(150),
  descricao: z.string().trim().min(1),
  dataEvento: z.iso.date(),
  horarioLargada: hhmm,
  localNome: z.string().trim().min(1),
  endereco: nullableText.default(null),
  complemento: nullableText.default(null),
  bairro: nullableText.default(null),
  cidade: z.string().trim().min(1),
  uf: z.string().regex(/^[A-Z]{2}$/, "UF deve ter 2 letras maiúsculas."),
  cep: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos.").nullable().default(null),
  latitude: z.number().min(-90).max(90).nullable().default(null),
  longitude: z.number().min(-180).max(180).nullable().default(null),
  imagemCapaUrl: z.url().nullable().default(null),
  galeriaUrl: z.url().nullable().default(null),
})

export const distanceSchema = z.object({
  nome: z.string().trim().min(1),
  descricao: nullableText.default(null),
  distanciaMetros: z.number().int().positive(),
  capacidadeTotal: z.number().int().positive(),
  horarioLargada: hhmm.nullable().default(null),
  percursoUrl: z.url().nullable().default(null),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
})

export const priceTierSchema = z.object({
  nome: z.string().trim().min(1),
  precoCentavos: z.number().int().min(0),
  inicioEm: isoInstant,
  fimEm: isoInstant,
  quantidadeTotal: z.number().int().positive().nullable().default(null),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
})

export const kitSchema = z.object({
  nome: z.string().trim().min(1),
  descricao: nullableText.default(null),
  ativo: z.boolean().default(true),
  fotos: z.array(z.object({ url: z.url(), alt: z.string(), ordem: z.number().int().min(0) })).default([]),
})

export const shirtSizeSchema = z.object({
  codigo: z.string().trim().min(1).max(10),
  descricao: nullableText.default(null),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
})

export const documentSchema = z.object({
  eventoId: id,
  tipo: z.enum(DOCUMENT_TYPE),
  versao: z.string().trim().min(1),
  titulo: z.string().trim().min(1),
  url: z.url(),
  hashSha256: z.string().regex(/^[a-f0-9]{64}$/, "hashSha256 deve ter 64 caracteres hexadecimais."),
  vigenteEm: isoInstant,
})
