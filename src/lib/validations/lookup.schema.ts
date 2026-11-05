import { z } from "zod"

import { onlyDigits } from "@/lib/utils"

/** Consulta sem login: aceita WhatsApp (10–11 dígitos) ou CPF (11 dígitos válidos). */
export const lookupSchema = z.object({
  query: z
    .string()
    .transform(onlyDigits)
    .refine(
      (v) => v.length === 10 || v.length === 11,
      "Informe o WhatsApp com DDD ou o CPF",
    ),
})

export type LookupInput = z.input<typeof lookupSchema>

