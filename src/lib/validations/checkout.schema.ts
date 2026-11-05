import { z } from "zod"

import { cartItemsSchema } from "./cart.schema"
import { participantSchema } from "./participant.schema"

export const checkoutFormSchema = participantSchema
  .pick({ name: true, cpf: true, whatsapp: true, email: true })
  .extend({
    acceptPrivacy: z.literal(true, { error: "Você precisa aceitar a política de privacidade" }),
  })

export const checkoutSchema = checkoutFormSchema.extend({ items: cartItemsSchema })

export type CheckoutFormInput = z.input<typeof checkoutFormSchema>
/** Valores do formulário: o checkbox começa desmarcado (`false`); o schema só aceita `true`. */
export type CheckoutFormValues = Omit<CheckoutFormInput, "acceptPrivacy"> & { acceptPrivacy: boolean }
export type CheckoutFormData = z.output<typeof checkoutFormSchema>
export type CheckoutInput = z.input<typeof checkoutSchema>
export type CheckoutData = z.output<typeof checkoutSchema>
