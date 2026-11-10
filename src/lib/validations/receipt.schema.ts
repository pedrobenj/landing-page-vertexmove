import { z } from "zod"

import { parseBrDate } from "@/lib/utils/parse-br-date"

/** Data de nascimento digitada (DD/MM/AAAA) para liberar o comprovante. */
const birthDateField = z
  .string()
  .trim()
  .min(1, "Informe a data de nascimento")
  .refine((value) => parseBrDate(value) !== null, "Data inválida")

/** Formulário do diálogo "Ver inscrição". */
export const receiptVerificationSchema = z.object({ dataNascimento: birthDateField })

/** Entrada das server actions do comprovante: referência da consulta + nascimento. */
export const receiptRequestSchema = z.object({
  referencia: z.string().trim().min(1).max(100),
  dataNascimento: birthDateField,
})

export type ReceiptVerificationInput = z.input<typeof receiptVerificationSchema>
export type ReceiptRequestInput = z.input<typeof receiptRequestSchema>
