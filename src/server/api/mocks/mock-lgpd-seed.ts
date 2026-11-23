import "server-only"

import { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"

import { addDays } from "./mock-time"
import type { MockLgpdRequest, MockRegistration } from "./mock-types"

/** `PRAZO_SOLICITACAO_DIAS` do backend. */
export const LGPD_RESPONSE_DAYS = 15
/** Alfabeto do `gerar-protocolo.ts` do backend (sem 0/O e 1/I). */
const PROTOCOL_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

/** `LGPD-AAAA-XXXXXXXX`. No backend é aleatório (opaco); aqui deriva do id, para os testes. */
export function lgpdProtocol(id: number, now: Date): string {
  let value = id * 7_919 + 1_048_576
  let suffix = ""
  for (let index = 0; index < 8; index++) {
    suffix = PROTOCOL_ALPHABET[value % PROTOCOL_ALPHABET.length] + suffix
    value = Math.floor(value / PROTOCOL_ALPHABET.length)
  }
  return `LGPD-${now.getFullYear()}-${suffix}`
}

/** Duas solicitações de demonstração: uma aberta de um atleta do seed e uma concluída de quem não tem cadastro. */
export function seedLgpdRequests(registrations: MockRegistration[], now: Date): MockLgpdRequest[] {
  const athlete = registrations.find((registration) => registration.cpf !== null && registration.email !== null)
  const openedAt = addDays(now, -2)
  const answeredAt = addDays(now, -5)
  return [
    {
      id: 1,
      protocolo: lgpdProtocol(1, openedAt),
      tipo: LGPD_REQUEST_TYPE.ACCESS,
      status: LGPD_REQUEST_STATUS.OPEN,
      nome: athlete?.nomeCompleto ?? "Atleta de Demonstração",
      cpf: athlete?.cpf ?? "52998224725",
      email: athlete?.email ?? "atleta@example.com",
      whatsapp: athlete?.whatsapp ?? null,
      mensagem: "Gostaria de receber uma cópia dos meus dados.",
      resposta: null,
      aceiteEm: openedAt.toISOString(),
      prazoEm: addDays(openedAt, LGPD_RESPONSE_DAYS).toISOString(),
      encerradaEm: null,
      anonimizadaEm: null,
      atualizadoPor: null,
      criadoEm: openedAt.toISOString(),
      atualizadoEm: openedAt.toISOString(),
    },
    {
      id: 2,
      protocolo: lgpdProtocol(2, answeredAt),
      tipo: LGPD_REQUEST_TYPE.INFORMATION,
      status: LGPD_REQUEST_STATUS.FULFILLED,
      nome: "Visitante Sem Cadastro",
      cpf: "11144477735",
      email: "visitante@example.com",
      whatsapp: null,
      mensagem: "Com quem vocês compartilham meus dados?",
      resposta: "Não encontramos dados seus. Explicamos por e-mail com quem compartilhamos dados de atletas.",
      aceiteEm: answeredAt.toISOString(),
      prazoEm: addDays(answeredAt, LGPD_RESPONSE_DAYS).toISOString(),
      encerradaEm: addDays(answeredAt, 1).toISOString(),
      anonimizadaEm: null,
      atualizadoPor: 1,
      criadoEm: answeredAt.toISOString(),
      atualizadoEm: addDays(answeredAt, 1).toISOString(),
    },
  ]
}
