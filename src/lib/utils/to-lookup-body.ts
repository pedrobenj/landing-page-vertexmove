import type { LookupData } from "@/lib/validations/lookup.schema"
import type { RegistrationLookupInput } from "@/types/api/registration.interface"

import { normalizeCpf } from "./normalize-cpf"
import { toE164Phone } from "./to-e164-phone"

/** Entrada da consulta (já validada) → corpo da API: CPF só dígitos ou WhatsApp em E.164, nunca os dois. */
export function toLookupBody({ tipo, valor }: LookupData): RegistrationLookupInput {
  return tipo === "cpf" ? { cpf: normalizeCpf(valor) } : { whatsapp: toE164Phone(valor) }
}
