import { z } from "zod"

import { ProductType } from "@/generated/prisma/enums"
import { parseCurrencyInput } from "@/lib/utils/currency-input"

const variantSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, "Informe o tamanho"),
  stock: z
    .string()
    .regex(/^\d+$/, "Estoque deve ser um número inteiro")
    .transform(Number),
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
      return cents
    }),
  pickupInfo: z.string().trim().min(5, "Informe local e horário de retirada"),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  variants: z
    .array(variantSchema)
    .min(1, "Adicione pelo menos um tamanho")
    .refine(
      (variants) => new Set(variants.map((v) => v.label.trim().toUpperCase())).size === variants.length,
      "Há tamanhos repetidos",
    ),
})

export type ProductFormInput = z.input<typeof productFormSchema>
export type ProductFormData = z.output<typeof productFormSchema>
