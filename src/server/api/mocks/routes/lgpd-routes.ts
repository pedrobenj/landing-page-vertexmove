import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"
import type { AdminLgpdRequest, AdminLgpdRequestSummary } from "@/types/api/lgpd-request.interface"

import { getMockDb, nextId, recordAudit } from "../mock-db"
import { invalidId, notFound, paramId, withAdmin } from "../mock-guards"
import { LGPD_RESPONSE_DAYS, lgpdProtocol } from "../mock-lgpd-seed"
import { apiError, json, type MockContext, type MockRoute, noContent } from "../mock-http"
import { maskName } from "../mock-mappers"
import { paginate } from "../mock-pagination"
import { lgpdRequestSchema, lgpdStatusSchema, validate } from "../mock-schemas"
import { addDays } from "../mock-time"
import type { MockRegistration } from "../mock-types"

const ENTITY = "solicitacao_titular"
const ANONYMIZED_NAME = "Titular anonimizado"
const FINAL_STATUSES: readonly LGPD_REQUEST_STATUS[] = [LGPD_REQUEST_STATUS.FULFILLED, LGPD_REQUEST_STATUS.REJECTED]

function holderRegistrations(cpf: string): MockRegistration[] {
  return getMockDb().registrations.filter((registration) => registration.cpf === cpf)
}

function toSummary(request: AdminLgpdRequest): AdminLgpdRequestSummary {
  return {
    id: request.id,
    protocolo: request.protocolo,
    tipo: request.tipo,
    status: request.status,
    nomeMascarado: maskName(request.nomeCompleto),
    titularEncontrado: request.titularEncontrado,
    criadoEm: request.criadoEm,
    prazoEm: request.prazoEm,
  }
}

function findRequest(ctx: MockContext): AdminLgpdRequest | Response {
  const id = paramId(ctx)
  if (id === null) return invalidId("id")
  return getMockDb().lgpdRequests.find((request) => request.id === id) ?? notFound("Solicitação")
}

function isEnumValue(values: object, value: string | null): boolean {
  return value === null || Object.values(values).includes(value)
}

/** Dados do titular no formato de `exportar_dados_titular` (migration 0021): sem CPF nem tokens. */
function buildExport(request: AdminLgpdRequest) {
  const db = getMockDb()
  const registrations = holderRegistrations(request.cpf)
  return {
    atletas: registrations.slice(0, 1).map((registration) => ({
      nomeCompleto: registration.nomeCompleto,
      dataNascimento: registration.dataNascimento,
      email: registration.email,
      whatsapp: registration.whatsapp,
    })),
    inscricoes: registrations.map((registration) => {
      const event = db.events.find((item) => item.id === registration.eventoId)
      return {
        codigo: registration.codigo,
        status: registration.status,
        nomeTitular: registration.nomeCompleto,
        evento: event ? { slug: event.slug, nome: event.nome, dataEvento: event.dataEvento } : null,
        distancia: db.distances.find((distance) => distance.id === registration.distanciaId)?.nome ?? null,
        valorTotalCentavos: registration.valorTotalCentavos,
        criadoEm: registration.inscritoEm,
      }
    }),
    pedidos: [],
    aceites: [],
  }
}

export const lgpdRoutes: MockRoute[] = [
  {
    // Público: mesma resposta exista ou não o titular (não revela cadastro).
    method: "POST",
    path: "/lgpd/solicitacoes",
    handler: (ctx) => {
      const input = validate(lgpdRequestSchema, ctx.body)
      if (input instanceof Response) return input
      const db = getMockDb()
      const now = new Date()
      const id = nextId(db.lgpdRequests)
      const request: AdminLgpdRequest = {
        ...input,
        id,
        protocolo: lgpdProtocol(id, now),
        status: LGPD_REQUEST_STATUS.OPEN,
        resposta: null,
        titularEncontrado: holderRegistrations(input.cpf).length > 0,
        criadoEm: now.toISOString(),
        prazoEm: addDays(now, LGPD_RESPONSE_DAYS).toISOString(),
        respondidoEm: null,
        anonimizadoEm: null,
      }
      db.lgpdRequests.push(request)
      return json(202, { protocolo: request.protocolo, prazoEm: request.prazoEm })
    },
  },
  {
    method: "GET",
    path: "/admin/lgpd/solicitacoes",
    handler: withAdmin((ctx) => {
      const status = ctx.query.get("status")
      const tipo = ctx.query.get("tipo")
      if (!isEnumValue(LGPD_REQUEST_STATUS, status) || !isEnumValue(LGPD_REQUEST_TYPE, tipo)) {
        return apiError(422, API_ERROR_CODE.INVALID_DATA, "status ou tipo inválido.")
      }
      const items = getMockDb()
        .lgpdRequests.filter((request) => (status === null || request.status === status) && (tipo === null || request.tipo === tipo))
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm) || b.id - a.id)
      const page = paginate(items, ctx.query, (request) => request.id, toSummary)
      return page instanceof Response ? page : json(200, page)
    }),
  },
  {
    method: "GET",
    path: "/admin/lgpd/solicitacoes/:id",
    handler: withAdmin((ctx, admin) => {
      const request = findRequest(ctx)
      if (request instanceof Response) return request
      recordAudit(admin, { acao: "visualizar_pii", entidade: ENTITY, entidadeId: request.id })
      return json(200, request)
    }),
  },
  {
    method: "POST",
    path: "/admin/lgpd/solicitacoes/:id/status",
    handler: withAdmin((ctx, admin) => {
      const request = findRequest(ctx)
      if (request instanceof Response) return request
      const input = validate(lgpdStatusSchema, ctx.body)
      if (input instanceof Response) return input
      request.status = input.status
      request.resposta = input.resposta || null
      request.respondidoEm = FINAL_STATUSES.includes(input.status) ? new Date().toISOString() : null
      recordAudit(admin, { acao: "atualizar", entidade: ENTITY, entidadeId: request.id })
      return json(200, request)
    }),
  },
  {
    method: "GET",
    path: "/admin/lgpd/solicitacoes/:id/exportacao",
    handler: withAdmin((ctx, admin) => {
      const request = findRequest(ctx)
      if (request instanceof Response) return request
      recordAudit(admin, { acao: "exportar", entidade: ENTITY, entidadeId: request.id })
      return json(200, buildExport(request), {
        headers: new Headers({ "Content-Disposition": `attachment; filename="titular-${request.protocolo}.json"` }),
      })
    }),
  },
  {
    // Irreversível: apaga nome e contatos das inscrições do titular (o histórico financeiro fica).
    method: "POST",
    path: "/admin/lgpd/solicitacoes/:id/anonimizar",
    handler: withAdmin((ctx, admin) => {
      const request = findRequest(ctx)
      if (request instanceof Response) return request
      if (request.anonimizadoEm !== null) {
        return apiError(409, API_ERROR_CODE.STATE_CONFLICT, "Os dados deste titular já foram anonimizados.")
      }
      const registrations = holderRegistrations(request.cpf)
      if (registrations.length === 0) {
        return apiError(409, API_ERROR_CODE.STATE_CONFLICT, "Nenhum cadastro encontrado para este titular.")
      }
      for (const registration of registrations) {
        Object.assign(registration, { nomeCompleto: ANONYMIZED_NAME, cpf: null, whatsapp: null, email: null })
      }
      request.anonimizadoEm = new Date().toISOString()
      recordAudit(admin, { acao: "anonimizar", entidade: ENTITY, entidadeId: request.id })
      return noContent()
    }),
  },
]
