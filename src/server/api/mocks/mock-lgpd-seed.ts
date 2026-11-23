import "server-only"

import { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"
import type { AdminLgpdRequest } from "@/types/api/lgpd-request.interface"

import { addDays } from "./mock-time"
import type { MockRegistration } from "./mock-types"

/** Prazo de resposta ao titular (art. 19, II da LGPD: 15 dias). */
export const LGPD_RESPONSE_DAYS = 15

/** `LGPD-AAAA-XXXXXXXX` (8 alfanuméricos maiúsculos, `ck_solicitacao_titular_protocolo`); no backend é opaco. */
export function lgpdProtocol(id: number, now: Date): string {
  return `LGPD-${now.getFullYear()}-${(id * 7_919 + 1_048_576).toString(36).toUpperCase().padStart(8, "0")}`
}

/** Duas solicitações de demonstração: uma aberta de um atleta cadastrado e uma concluída sem cadastro. */
export function seedLgpdRequests(registrations: MockRegistration[], now: Date): AdminLgpdRequest[] {
  const athlete = registrations.find((registration) => registration.cpf !== null && registration.email !== null)
  const openedAt = addDays(now, -2)
  const answeredAt = addDays(now, -5)
  return [
    {
      id: 1,
      protocolo: lgpdProtocol(1, openedAt),
      tipo: LGPD_REQUEST_TYPE.ACCESS,
      status: LGPD_REQUEST_STATUS.OPEN,
      nomeCompleto: athlete?.nomeCompleto ?? "Atleta de Demonstração",
      cpf: athlete?.cpf ?? "52998224725",
      email: athlete?.email ?? "atleta@example.com",
      whatsapp: athlete?.whatsapp ?? null,
      mensagem: "Gostaria de receber uma cópia dos meus dados.",
      resposta: null,
      titularEncontrado: athlete !== undefined,
      criadoEm: openedAt.toISOString(),
      prazoEm: addDays(openedAt, LGPD_RESPONSE_DAYS).toISOString(),
      respondidoEm: null,
      anonimizadoEm: null,
    },
    {
      id: 2,
      protocolo: lgpdProtocol(2, answeredAt),
      tipo: LGPD_REQUEST_TYPE.INFORMATION,
      status: LGPD_REQUEST_STATUS.FULFILLED,
      nomeCompleto: "Visitante Sem Cadastro",
      cpf: "11144477735",
      email: "visitante@example.com",
      whatsapp: null,
      mensagem: "Com quem vocês compartilham meus dados?",
      resposta: "Não encontramos dados seus. Explicamos por e-mail com quem compartilhamos dados de atletas.",
      titularEncontrado: false,
      criadoEm: answeredAt.toISOString(),
      prazoEm: addDays(answeredAt, LGPD_RESPONSE_DAYS).toISOString(),
      respondidoEm: addDays(answeredAt, 1).toISOString(),
      anonimizadoEm: null,
    },
  ]
}
