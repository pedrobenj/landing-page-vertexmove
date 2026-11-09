import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import { EVENT_STATUS } from "@/enums/event-status.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { CreatedRegistration, RegistrationLookupItem } from "@/types/api/registration.interface"

import { getMockDb, nextId } from "../mock-db"
import { apiError, created, json, type MockRoute } from "../mock-http"
import { findCurrentDocuments, findCurrentTier, isActiveRegistrationStatus, isSoldOut, maskName } from "../mock-mappers"
import { paginate } from "../mock-pagination"
import { createRegistrationSchema, lookupSchema, validate } from "../mock-schemas"
import { ageOn, toFortalezaIso, todayInFortaleza } from "../mock-time"
import type { MockRegistration } from "../mock-types"

const SENIOR_AGE = 60
const SENIOR_DISCOUNT_PERCENT = 50

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

      if (input.kitId && !db.kits.some((kit) => kit.id === input.kitId && kit.eventoId === event.id && kit.ativo)) {
        return apiError(422, API_ERROR_CODE.INVALID_DATA, "Kit inválido para este evento.")
      }
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
      const valorBaseCentavos = tier.precoCentavos
      const valorDescontoCentavos =
        ageOn(input.dataNascimento, event.dataEvento) >= SENIOR_AGE
          ? Math.round((valorBaseCentavos * SENIOR_DISCOUNT_PERCENT) / 100)
          : 0
      const registration: MockRegistration = {
        id,
        codigo: `VX-${todayInFortaleza().slice(0, 4)}-${String(id).padStart(8, "0")}`,
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
        nomeMascarado: maskName(item.nomeCompleto),
        evento: db.events.find((event) => event.id === item.eventoId)?.nome ?? "",
        distancia: db.distances.find((distance) => distance.id === item.distanciaId)?.nome ?? "",
        status: item.status,
        inscritoEm: item.inscritoEm,
      }))
      return page instanceof Response ? page : json(200, page)
    },
  },
]
