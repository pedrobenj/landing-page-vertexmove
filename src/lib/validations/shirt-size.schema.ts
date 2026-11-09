import { z } from "zod"

import { intField, optionalTextField } from "./form-fields"

/** Tamanho de camisa (catálogo global). Chaves de `POST /admin/tamanhos-camisa`. */
export const shirtSizeFormSchema = z.object({
  codigo: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Informe o código (ex.: GG)")
    .max(10, "Código com no máximo 10 caracteres")
    .regex(/^[A-Z0-9-]+$/, "Use letras, números e hífen (ex.: GG, BL-P)"),
  descricao: optionalTextField,
  ordem: intField("Ordem deve ser um número inteiro", { max: 999 }),
  ativo: z.boolean(),
})

export type ShirtSizeFormInput = z.input<typeof shirtSizeFormSchema>
export type ShirtSizeFormData = z.output<typeof shirtSizeFormSchema>
