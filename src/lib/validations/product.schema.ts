import { z } from "zod"

import { PRODUCT_TYPE } from "@/enums/product-type.enum"
import { MAX_PRODUCT_PRICE_CENTS, MAX_VARIANT_LABEL_LENGTH, MAX_VARIANT_STOCK } from "@/lib/utils/constants"
import { parseCurrencyInput } from "@/lib/utils/currency-input"

const stockSchema = z
  .string()
  .regex(/^\d+$/, "Estoque deve ser um número inteiro")
  .transform(Number)
  .pipe(z.number().max(MAX_VARIANT_STOCK, "Estoque máximo de 100.000 unidades"))

const variantSchema = z.object({
  id: z.string().optional(),
  label: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Informe o tamanho")
    .max(MAX_VARIANT_LABEL_LENGTH, `Tamanho com no máximo ${MAX_VARIANT_LABEL_LENGTH} caracteres`),
  stock: stockSchema,
  /** Estoque quando o formulário foi aberto (só tamanhos já salvos). O servidor aplica a diferença. */
  originalStock: stockSchema.optional(),
})

export const productFormSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome do produto"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use só letras minúsculas, números e hífens"),
  description: z.string().trim().min(10, "Descreva o produto (mínimo de 10 caracteres)"),
  type: z.enum(PRODUCT_TYPE, { error: "Escolha o tipo" }),
  price: z
    .string()
    .transform((value, ctx) => {
      const cents = parseCurrencyInput(value)
      if (cents === null || cents <= 0) {
        ctx.addIssue({ code: "custom", message: "Informe um preço válido, ex: 89,90" })
        return z.NEVER
      }
      if (cents > MAX_PRODUCT_PRICE_CENTS) {
        ctx.addIssue({ code: "custom", message: "Preço máximo de R$ 10.000,00" })
        return z.NEVER
      }
      return cents
    }),
  pickupInfo: z.string().trim().min(5, "Informe local e horário de retirada"),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  variants: z
    .array(variantSchema)
    .min(1, "Adicione pelo menos um tamanho")
    // Erro em cada linha repetida (não no array), para aparecer ao lado do campo certo.
    .superRefine((variants, ctx) => {
      const counts = new Map<string, number>()
      for (const variant of variants) counts.set(variant.label, (counts.get(variant.label) ?? 0) + 1)
      variants.forEach((variant, index) => {
        if ((counts.get(variant.label) ?? 0) > 1) {
          ctx.addIssue({ code: "custom", message: "Tamanho repetido", path: [index, "label"] })
        }
      })
    }),
})

export type ProductFormInput = z.input<typeof productFormSchema>
export type ProductFormData = z.output<typeof productFormSchema>
