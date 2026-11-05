import { z } from "zod"

import { PaymentMethod } from "@/generated/prisma/enums"

import { REQUIRED_MESSAGE } from "./messages"
import { participantSchema } from "./participant.schema"

export const modalityAndKitSchema = z.object({
  modalityId: z.string().min(1, "Escolha a distância"),
  kitId: z.string().min(1, "Escolha o kit"),
  shirtSize: z.string().min(1, "Escolha o tamanho da camisa"),
})

export const termsSchema = z.object({
  acceptRegulation: z.literal(true, { error: "Você precisa aceitar o regulamento" }),
  acceptHealthTerm: z.literal(true, { error: "Você precisa aceitar o termo de responsabilidade" }),
  acceptPrivacy: z.literal(true, { error: "Você precisa aceitar a política de privacidade" }),
})

/** Payload completo enviado à server action. Preço NÃO vem do client — é recalculado no servidor. */
export const createRegistrationSchema = z.object({
  eventSlug: z.string().min(1, REQUIRED_MESSAGE),
  ...modalityAndKitSchema.shape,
  participant: participantSchema,
  terms: termsSchema,
  couponCode: z.string().trim().toUpperCase().optional(),
  paymentMethod: z.enum(PaymentMethod),
})

export type ModalityAndKitInput = z.input<typeof modalityAndKitSchema>
export type TermsInput = z.input<typeof termsSchema>
export type CreateRegistrationInput = z.input<typeof createRegistrationSchema>
