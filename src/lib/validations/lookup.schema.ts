import { z } from "zod"

import { isValidBrPhone } from "@/lib/utils/is-valid-br-phone"
import { isValidCpf } from "@/lib/utils/is-valid-cpf"

export const LOOKUP_TYPES = ["whatsapp", "cpf"] as const
export type LookupType = (typeof LOOKUP_TYPES)[number]

/** Consulta sem login: um único campo cuja validação depende do tipo escolhido. */
export const lookupSchema = z
  .object({
    tipo: z.enum(LOOKUP_TYPES, { error: "Escolha WhatsApp ou CPF" }),
    valor: z.string().trim().max(30),
  })
  .superRefine(({ tipo, valor }, ctx) => {
    const isCpf = tipo === "cpf"
    if (valor === "") {
      ctx.addIssue({ code: "custom", path: ["valor"], message: isCpf ? "Informe o CPF" : "Informe o WhatsApp" })
      return
    }
    if (isCpf ? !isValidCpf(valor) : !isValidBrPhone(valor)) {
      ctx.addIssue({ code: "custom", path: ["valor"], message: isCpf ? "CPF inválido" : "Informe um WhatsApp válido com DDD" })
    }
  })

export type LookupInput = z.input<typeof lookupSchema>
export type LookupData = z.output<typeof lookupSchema>
