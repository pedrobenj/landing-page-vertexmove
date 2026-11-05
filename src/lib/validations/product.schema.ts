import { z } from "zod"

import { ProductType } from "@/generated/prisma/enums"
import { MAX_PRODUCT_PRICE_CENTS, MAX_VARIANT_LABEL_LENGTH, MAX_VARIANT_STOCK } from "@/lib/utils/constants"
import { parseCurrencyInput } from "@/lib/utils/currency-input"

const variantSchema = z.object({
  id: z.string().optional(),
  label: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Informe o tamanho")
    .max(MAX_VARIANT_LABEL_LENGTH, `Tamanho com no máximo ${MAX_VARIANT_LABEL_LENGTH} caracteres`),
  stock: z
    .string()
    .regex(/^\d+$/, "Estoque deve ser um número inteiro")
    .transform(Number)
    .pipe(z.number().max(MAX_VARIANT_STOCK, "Estoque máximo de 100.000 unidades")),
})

export const productFormSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome do produto"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use só letras minúsculas, números e hífens"),
  description: z.string().trim().min(10, "Descreva o produto (mínimo de 10 caracteres)"),
  type: z.enum(ProductType, { error: "Escolha o tipo" }),
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
    .refine(
      (variants) => new Set(variants.map((v) => v.label)).size === variants.length,
      "Há tamanhos repetidos",
    ),
})

export type ProductFormInput = z.input<typeof productFormSchema>
export type ProductFormData = z.output<typeof productFormSchema>
