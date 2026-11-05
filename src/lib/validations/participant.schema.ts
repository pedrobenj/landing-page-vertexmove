import { z } from "zod"

import { Gender } from "@/generated/prisma/enums"
import { isValidCpf, onlyDigits } from "@/lib/utils"

import { REQUIRED_MESSAGE } from "./messages"

const phoneSchema = z
  .string()
  .transform(onlyDigits)
  .refine((v) => v.length === 10 || v.length === 11, "Informe um telefone com DDD")

export const participantSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome completo"),
  cpf: z.string().transform(onlyDigits).refine(isValidCpf, "CPF inválido"),
  birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use o formato DD/MM/AAAA"),
  gender: z.enum(Gender, { error: REQUIRED_MESSAGE }),
  whatsapp: phoneSchema,
  email: z.string().trim().toLowerCase().pipe(z.email("E-mail inválido")),
  team: z.string().trim().optional(),
  emergencyContactName: z.string().trim().min(3, "Informe o nome do contato de emergência"),
  emergencyContactPhone: phoneSchema,
})

export type ParticipantInput = z.input<typeof participantSchema>
export type ParticipantData = z.output<typeof participantSchema>
