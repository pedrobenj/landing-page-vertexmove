import type { AthleteStepData, DistanceStepData } from "@/lib/validations/registration.schema"
import type { CreateRegistrationInput } from "@/types/api/registration.interface"

import { toApiDate } from "./format-api-date"
import { normalizeCpf } from "./normalize-cpf"
import { normalizeName } from "./normalize-name"
import { toE164Phone } from "./to-e164-phone"

interface RegistrationFormData {
  distance: DistanceStepData
  athlete: AthleteStepData
}

/**
 * Estado do formulário → corpo de `POST /inscricoes`: CPF só com dígitos, WhatsApp em E.164 e data
 * `YYYY-MM-DD`. Campos vazios (e kit/tamanho não escolhidos) são omitidos. Lança erro se a data ou
 * o telefone forem inválidos — os schemas das etapas já garantem que não são.
 */
export function toCreateRegistrationInput(
  eventSlug: string,
  { distance, athlete }: RegistrationFormData,
  documentIds: number[],
): CreateRegistrationInput {
  const cpf = normalizeCpf(athlete.cpf)
  const whatsapp = athlete.whatsapp.trim()
  const email = athlete.email.trim()

  return {
    eventoSlug: eventSlug,
    distanciaId: distance.distanciaId,
    ...(distance.kitId !== null && { kitId: distance.kitId }),
    ...(distance.kitId !== null && distance.tamanhoCamisaId !== null && { tamanhoCamisaId: distance.tamanhoCamisaId }),
    nomeCompleto: normalizeName(athlete.nomeCompleto),
    dataNascimento: toApiDate(athlete.dataNascimento.trim()),
    ...(cpf !== "" && { cpf }),
    ...(whatsapp !== "" && { whatsapp: toE164Phone(whatsapp) }),
    ...(email !== "" && { email }),
    documentosAceitos: documentIds,
  }
}
