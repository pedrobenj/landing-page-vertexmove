import "server-only"

import { randomUUID } from "node:crypto"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import { EVENT_STATUS } from "@/enums/event-status.enum"
import { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import { MOCK_CHECKOUT_PATH } from "@/lib/utils/checkout-url"
import { maskCpf } from "@/lib/utils/masks"
import type { ApiCheckout, ApiRegistrationStatus } from "@/types/api/registration-details.interface"
import type { RegistrationReceipt } from "@/types/api/registration-receipt.interface"
import type { CreatedRegistration, RegistrationLookupItem } from "@/types/api/registration.interface"

import { getMockDb, nextId } from "../mock-db"
import { apiError, created, json, noContent, type MockRoute } from "../mock-http"
import { findCurrentDocuments, findCurrentTier, isActiveRegistrationStatus, isSoldOut, maskName } from "../mock-mappers"
import { paginate } from "../mock-pagination"
import { createRegistrationSchema, lookupSchema, mockPaymentSchema, receiptSchema, validate } from "../mock-schemas"
import { ageOn, toFortalezaIso, todayInFortaleza } from "../mock-time"
import type { MockRegistration } from "../mock-types"

/** Reserva da vaga enquanto a inscrição está pendente (igual ao padrão do backend). */
const REGISTRATION_HOLD_MS = 30 * 60 * 1000

const SENIOR_AGE = 60
const SENIOR_DISCOUNT_PERCENT = 50

/** Atraso do "webhook" simulado: dá tempo de a página de retorno mostrar "Confirmando seu pagamento…". */
const MOCK_WEBHOOK_DELAY_MS = 4_000

/** Aplica a aprovação simulada quando o atraso do "webhook" passou. */
function settlePayment(registration: MockRegistration): void {
  if (registration.aprovacaoEm && Date.now() >= registration.aprovacaoEm) {
    registration.status = REGISTRATION_STATUS.CONFIRMED
    registration.pagamentoStatus = PAYMENT_STATUS.APPROVED
    registration.aprovacaoEm = null
  }
}

function findRegistration(codigo: string): MockRegistration | undefined {
  const registration = getMockDb().registrations.find((item) => item.codigo === codigo)
  if (registration) settlePayment(registration)
  return registration
}

/** Como o backend: o token de `POST /inscricoes` é a única credencial de status e pagamento. */
function authorize(headers: Headers, registration: MockRegistration): Response | null {
  const [scheme, token] = (headers.get("Authorization") ?? "").split(" ")
  return scheme === "Bearer" && token === registration.accessToken
    ? null
    : apiError(401, API_ERROR_CODE.NOT_AUTHENTICATED, "Não autenticado.")
}

function holdExpiresAt(registration: MockRegistration): string {
  return new Date(Date.parse(registration.inscritoEm) + REGISTRATION_HOLD_MS).toISOString()
}

function toCheckout(registration: MockRegistration, status: PAYMENT_STATUS): ApiCheckout {
  return {
    pagamentoId: registration.id,
    status,
    checkoutUrl: `${MOCK_CHECKOUT_PATH}${registration.codigo}`,
    expiraEm: holdExpiresAt(registration),
    gatewayPreferenceId: `MOCK-PREF-${registration.id}`,
  }
}

/**
 * `StatusInscricaoResponse` do backend. Inclui `eventoSlug`, `dataEvento` e `horarioLargada`, que a fase 3
 * do plano pede ao backend (o front trata a ausência deles).
 */
function toStatus(registration: MockRegistration): ApiRegistrationStatus {
  const db = getMockDb()
  const event = db.events.find((item) => item.id === registration.eventoId)
  return {
    codigo: registration.codigo,
    status: registration.status,
    expiraEm: holdExpiresAt(registration),
    valorTotalCentavos: registration.valorTotalCentavos,
    eventoNome: event?.nome ?? "",
    distanciaNome: db.distances.find((item) => item.id === registration.distanciaId)?.nome ?? "",
    eventoSlug: event?.slug,
    dataEvento: event?.dataEvento,
    horarioLargada: event?.horarioLargada,
    pagamento: registration.pagamentoStatus ? toCheckout(registration, registration.pagamentoStatus) : null,
  }
}

function toReceipt(registration: MockRegistration): RegistrationReceipt {
  const db = getMockDb()
  const event = db.events.find((item) => item.id === registration.eventoId)
  return {
    codigo: registration.codigo,
    status: registration.status,
    nomeCompleto: registration.nomeCompleto,
    cpfMascarado: registration.cpf ? maskCpf(registration.cpf) : null,
    evento: {
      nome: event?.nome ?? "",
      dataEvento: event?.dataEvento ?? "",
      horarioLargada: event?.horarioLargada ?? "",
      localizacaoResumo: event ? `${event.localNome} — ${event.cidade}/${event.uf}` : "",
    },
    distancia: db.distances.find((item) => item.id === registration.distanciaId)?.nome ?? "",
    kit: db.kits.find((item) => item.id === registration.kitId)?.nome ?? null,
    tamanhoCamisa: db.shirtSizes.find((item) => item.id === registration.tamanhoCamisaId)?.codigo ?? null,
    valorBaseCentavos: registration.valorBaseCentavos,
    valorDescontoCentavos: registration.valorDescontoCentavos,
    valorTotalCentavos: registration.valorTotalCentavos,
    inscritoEm: registration.inscritoEm,
  }
}

function sameAthleteName(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase("pt-BR") === b.trim().toLocaleLowerCase("pt-BR")
}

export const registrationRoutes: MockRoute[] = [
  {
    method: "POST",
    path: "/inscricoes",
    handler: ({ body }) => {
      const input = validate(createRegistrationSchema, body)
      if (input instanceof Response) return input

      const db = getMockDb()
      const event = db.events.find(
        (item) => item.slug === input.eventoSlug && item.status === EVENT_STATUS.PUBLISHED && !item.deletedAt,
      )
      if (!event) return apiError(404, API_ERROR_CODE.NOT_FOUND, "Evento não encontrado.")

      const distance = db.distances.find((item) => item.id === input.distanciaId && item.eventoId === event.id && item.ativo)
      if (!distance) return apiError(422, API_ERROR_CODE.INVALID_DATA, "Distância inválida para este evento.")
      if (isSoldOut(distance)) return apiError(409, API_ERROR_CODE.SOLD_OUT, "As vagas desta distância esgotaram.")

      const tier = findCurrentTier(distance.id)
      if (!tier) return apiError(422, API_ERROR_CODE.INVALID_DATA, "Não há lote vigente para esta distância.")

      const kit = input.kitId ? db.kits.find((item) => item.id === input.kitId && item.eventoId === event.id && item.ativo) : null
      if (input.kitId && !kit) return apiError(422, API_ERROR_CODE.INVALID_DATA, "Kit inválido para este evento.")
      if (input.tamanhoCamisaId && !db.shirtSizes.some((size) => size.id === input.tamanhoCamisaId && size.ativo)) {
        return apiError(422, API_ERROR_CODE.INVALID_DATA, "Tamanho de camisa inválido.")
      }

      const documents = findCurrentDocuments(event.id)
      const required = [DOCUMENT_TYPE.REGULATION, DOCUMENT_TYPE.LIABILITY_TERM].map(
        (tipo) => documents.find((document) => document.tipo === tipo)?.id,
      )
      if (required.some((documentId) => documentId === undefined || !input.documentosAceitos.includes(documentId))) {
        return apiError(
          422,
          API_ERROR_CODE.DOCUMENT_ACCEPTANCE_REQUIRED,
          "É obrigatório aceitar o regulamento e o termo de responsabilidade vigentes.",
        )
      }

      const cpf = input.cpf ?? null
      const whatsapp = input.whatsapp ?? null
      if (cpf && whatsapp && db.registrations.some((item) => item.cpf === cpf && item.whatsapp && item.whatsapp !== whatsapp)) {
        return apiError(409, API_ERROR_CODE.CONFLICTING_IDENTITIES, "CPF e WhatsApp pertencem a atletas diferentes.")
      }

      const duplicate = db.registrations.some(
        (item) =>
          item.distanciaId === distance.id &&
          isActiveRegistrationStatus(item.status) &&
          ((cpf && item.cpf === cpf) ||
            (whatsapp &&
              item.whatsapp === whatsapp &&
              item.dataNascimento === input.dataNascimento &&
              sameAthleteName(item.nomeCompleto, input.nomeCompleto))),
      )
      if (duplicate) {
        return apiError(409, API_ERROR_CODE.DUPLICATE_REGISTRATION, "Já existe uma inscrição para este atleta nesta distância.")
      }

      const id = nextId(db.registrations)
      // Base = lote + kit. O desconto 60+ vale só sobre a inscrição (lote), não sobre o kit.
      const valorBaseCentavos = tier.precoCentavos + (kit?.precoCentavos ?? 0)
      const valorDescontoCentavos =
        ageOn(input.dataNascimento, event.dataEvento) >= SENIOR_AGE
          ? Math.round((tier.precoCentavos * SENIOR_DISCOUNT_PERCENT) / 100)
          : 0
      const registration: MockRegistration = {
        id,
        codigo: `VX-${todayInFortaleza().slice(0, 4)}-${String(id).padStart(8, "0")}`,
        referencia: randomUUID(),
        accessToken: randomUUID(),
        eventoId: event.id,
        distanciaId: distance.id,
        kitId: input.kitId ?? null,
        tamanhoCamisaId: input.tamanhoCamisaId ?? null,
        nomeCompleto: input.nomeCompleto,
        dataNascimento: input.dataNascimento,
        cpf,
        whatsapp,
        email: input.email ?? null,
        documentosAceitos: input.documentosAceitos,
        status: REGISTRATION_STATUS.PENDING,
        valorBaseCentavos,
        valorDescontoCentavos,
        valorTotalCentavos: valorBaseCentavos - valorDescontoCentavos,
        inscritoEm: toFortalezaIso(new Date()),
        pagamentoStatus: null,
        aprovacaoEm: null,
      }
      db.registrations.push(registration)

      const response: CreatedRegistration = {
        codigo: registration.codigo,
        status: registration.status,
        valorBaseCentavos,
        valorDescontoCentavos,
        valorTotalCentavos: registration.valorTotalCentavos,
        kitId: registration.kitId,
        tamanhoCamisaId: registration.tamanhoCamisaId,
        expiraEm: new Date(Date.now() + REGISTRATION_HOLD_MS).toISOString(),
        eventoSlug: event.slug,
        distanciaId: distance.id,
        accessToken: registration.accessToken,
      }
      return created(response, `/inscricoes/${registration.codigo}`)
    },
  },
  {
    method: "POST",
    path: "/inscricoes/consulta",
    handler: ({ body, query }) => {
      const input = validate(lookupSchema, body)
      if (input instanceof Response) {
        return apiError(422, API_ERROR_CODE.INVALID_DATA, "Informe exatamente um entre CPF e WhatsApp.")
      }

      const db = getMockDb()
      const matches = db.registrations
        .filter((item) => ("cpf" in input ? item.cpf === input.cpf : item.whatsapp === input.whatsapp))
        .sort((a, b) => b.id - a.id)
      const page = paginate(matches, query, (item) => item.id, (item): RegistrationLookupItem => ({
        referencia: item.referencia,
        nomeMascarado: maskName(item.nomeCompleto),
        evento: db.events.find((event) => event.id === item.eventoId)?.nome ?? "",
        distancia: db.distances.find((distance) => distance.id === item.distanciaId)?.nome ?? "",
        status: item.status,
        inscritoEm: item.inscritoEm,
      }))
      return page instanceof Response ? page : json(200, page)
    },
  },
  {
    method: "POST",
    path: "/inscricoes/comprovante",
    handler: ({ body }) => {
      const input = validate(receiptSchema, body)
      if (input instanceof Response) return input
      // Referência inexistente ou nascimento errado: mesma resposta, para não revelar qual dos dois falhou.
      const match = getMockDb().registrations.find(
        (item) => item.referencia === input.referencia && item.dataNascimento === input.dataNascimento,
      )
      const registration = match ? findRegistration(match.codigo) : undefined
      if (!registration) return apiError(404, API_ERROR_CODE.NOT_FOUND, "Inscrição não encontrada.")
      return json(200, toReceipt(registration))
    },
  },
  {
    method: "GET",
    path: "/inscricoes/:codigo",
    handler: ({ params, headers }) => {
      const registration = findRegistration(params.codigo)
      if (!registration) return apiError(404, API_ERROR_CODE.NOT_FOUND, "Inscrição não encontrada.")
      const denied = authorize(headers, registration)
      if (denied) return denied
      return json(200, toStatus(registration))
    },
  },
  {
    // Cria a "preferência" do Checkout Pro. O mock aponta para o checkout falso local em vez do Mercado Pago.
    method: "POST",
    path: "/inscricoes/:codigo/pagamentos",
    handler: ({ params, headers }) => {
      const registration = findRegistration(params.codigo)
      if (!registration) return apiError(404, API_ERROR_CODE.NOT_FOUND, "Inscrição não encontrada.")
      const denied = authorize(headers, registration)
      if (denied) return denied
      if (!headers.get("Idempotency-Key")) {
        return apiError(422, API_ERROR_CODE.INVALID_DATA, "Idempotency-Key obrigatório.")
      }
      if (registration.status !== REGISTRATION_STATUS.PENDING || registration.aprovacaoEm) {
        return apiError(409, API_ERROR_CODE.PAYMENT_UNAVAILABLE, "A inscrição não está aguardando pagamento.")
      }
      return created(toCheckout(registration, PAYMENT_STATUS.PENDING), `/inscricoes/${registration.codigo}`)
    },
  },
  {
    // Só no mock: faz o papel do webhook do Mercado Pago (o real fica no backend).
    method: "POST",
    path: "/dev/pagamentos/:codigo",
    handler: ({ params, body }) => {
      const input = validate(mockPaymentSchema, body)
      if (input instanceof Response) return input

      const registration = findRegistration(params.codigo)
      if (!registration) return apiError(404, API_ERROR_CODE.NOT_FOUND, "Inscrição não encontrada.")
      if (registration.status !== REGISTRATION_STATUS.PENDING) {
        return apiError(409, API_ERROR_CODE.PAYMENT_UNAVAILABLE, "A inscrição não está aguardando pagamento.")
      }

      if (input.resultado === PAYMENT_STATUS.APPROVED) {
        // Até o "webhook" chegar, o backend não sabe do pagamento: `pagamento` continua como estava.
        registration.aprovacaoEm = Date.now() + MOCK_WEBHOOK_DELAY_MS
      } else {
        registration.pagamentoStatus = input.resultado
      }
      return noContent()
    },
  },
]
