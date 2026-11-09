import { z } from "zod"

import { parseCurrencyInput } from "@/lib/utils/currency-input"
import { isFortalezaLocalInput, toFortalezaIso } from "@/lib/utils/fortaleza-datetime"

/**
 * Campos reutilizáveis dos formulários do admin. Os inputs são texto; a saída já vem no formato da API.
 */

const isHttpUrl = (value: string) => z.url({ protocol: /^https?$/ }).safeParse(value).success
export const HH_MM_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
const URL_MESSAGE = "Informe uma URL válida, começando com https://"

/** Texto opcional: vazio vira `null`. */
export const optionalTextField = z
  .string()
  .trim()
  .transform((value) => value || null)

/** URL http(s) obrigatória. */
export const urlField = z.string().trim().refine(isHttpUrl, URL_MESSAGE)

/** URL http(s) opcional: vazio vira `null`. */
export const optionalUrlField = z
  .string()
  .trim()
  .refine((value) => value === "" || isHttpUrl(value), URL_MESSAGE)
  .transform((value) => value || null)

/** Horário `HH:mm` opcional (input `type="time"`): vazio vira `null`. */
export const optionalTimeField = z
  .string()
  .trim()
  .refine((value) => value === "" || HH_MM_PATTERN.test(value), "Informe um horário válido")
  .transform((value) => value || null)

/** `"12"` → `12`, ou `null` se não for inteiro dentro do intervalo. */
function parseIntInRange(value: string, min: number, max: number): number | null {
  const number = /^\d+$/.test(value) ? Number(value) : Number.NaN
  return Number.isSafeInteger(number) && number >= min && number <= max ? number : null
}

/** Inteiro digitado como texto, entre `min` e `max`. */
export function intField(message: string, { min = 0, max = 1_000_000 }: { min?: number; max?: number } = {}) {
  return z
    .string()
    .trim()
    .transform((value, ctx) => {
      const number = parseIntInRange(value, min, max)
      if (number === null) {
        ctx.addIssue({ code: "custom", message })
        return z.NEVER
      }
      return number
    })
}

/**
 * Inteiro opcional: vazio vira `null`. Um só transform (e não `z.union`): no Zod 4 a união devolve
 * `invalid_union` com a mensagem genérica em inglês em vez da nossa.
 */
export function optionalIntField(message: string, { min = 0, max = 1_000_000 }: { min?: number; max?: number } = {}) {
  return z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (value === "") return null
      const number = parseIntInRange(value, min, max)
      if (number === null) {
        ctx.addIssue({ code: "custom", message })
        return z.NEVER
      }
      return number
    })
}

/** Preço em reais ("89,90", "89.90", "1.234,56") → centavos. Aceita zero (cortesia). */
export function priceCentsField(maxCents = 10_000_000) {
  return z.string().transform((value, ctx) => {
    const cents = parseCurrencyInput(value)
    if (cents === null) {
      ctx.addIssue({ code: "custom", message: "Informe um preço válido, ex: 89,90" })
      return z.NEVER
    }
    if (cents > maxCents) {
      ctx.addIssue({ code: "custom", message: "Preço acima do limite" })
      return z.NEVER
    }
    return cents
  })
}

/** `datetime-local` (hora de Fortaleza) → instante ISO com `-03:00`. */
export function fortalezaDateTimeField(message: string) {
  return z
    .string()
    .trim()
    .refine(isFortalezaLocalInput, message)
    .transform((value) => toFortalezaIso(value))
}
