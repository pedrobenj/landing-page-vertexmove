import { z } from "zod"

import { isValidBrPhone, isValidCpf, onlyDigits } from "@/lib/utils"

import { cartItemsSchema } from "./cart.schema"

export const checkoutFormSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome completo"),
  cpf: z.string().transform(onlyDigits).refine(isValidCpf, "CPF inválido"),
  whatsapp: z.string().transform(onlyDigits).refine(isValidBrPhone, "Informe um WhatsApp válido com DDD"),
  email: z.string().trim().toLowerCase().pipe(z.email("E-mail inválido")),
  acceptPrivacy: z.literal(true, { error: "Você precisa aceitar a política de privacidade" }),
})

export const checkoutSchema = checkoutFormSchema.extend({ items: cartItemsSchema })

export type CheckoutFormInput = z.input<typeof checkoutFormSchema>
/** Valores do formulário: o checkbox começa desmarcado (`false`); o schema só aceita `true`. */
export type CheckoutFormValues = Omit<CheckoutFormInput, "acceptPrivacy"> & { acceptPrivacy: boolean }
export type CheckoutFormData = z.output<typeof checkoutFormSchema>
export type CheckoutInput = z.input<typeof checkoutSchema>
export type CheckoutData = z.output<typeof checkoutSchema>
