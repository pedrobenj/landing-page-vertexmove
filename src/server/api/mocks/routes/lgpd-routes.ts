import "server-only"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { LGPD_REQUEST_STATUS } from "@/enums/lgpd-request-status.enum"
import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import { maskCpf } from "@/lib/utils/masks"
import type {
  AdminLgpdRequest,
  AdminLgpdRequestStatus,
  AdminLgpdRequestSummary,
  LgpdAnonymizationResult,
} from "@/types/api/lgpd-request.interface"

import { getMockDb, nextId, recordAudit } from "../mock-db"
import { invalidId, notFound, paramId, withAdmin } from "../mock-guards"
import { apiError, json, type MockContext, type MockRoute } from "../mock-http"
import { LGPD_RESPONSE_DAYS, lgpdProtocol } from "../mock-lgpd-seed"
import { paginate } from "../mock-pagination"
import { lgpdAnonymizeSchema, lgpdListQuerySchema, lgpdRequestSchema, lgpdStatusSchema, validate } from "../mock-schemas"
import { addDays } from "../mock-time"
import type { MockLgpdRequest, MockRegistration } from "../mock-types"

const ENTITY = "solicitacao_titular"
const ANONYMIZED_NAME = "Titular anonimizado"

const isFinal = (status: LGPD_REQUEST_STATUS) => status === LGPD_REQUEST_STATUS.FULFILLED || status === LGPD_REQUEST_STATUS.REJECTED

/** `transicaoPermitida`: aberta → qualquer outro; em andamento → final; finais não mudam. */
function canTransition(from: LGPD_REQUEST_STATUS, to: LGPD_REQUEST_STATUS): boolean {
  if (from === to || isFinal(from)) return false
  return from === LGPD_REQUEST_STATUS.OPEN || to !== LGPD_REQUEST_STATUS.OPEN
}

/** `mascararNome`: `Maria Titular Souza` → `Maria S.`. */
function maskRequesterName(name: string): string {
  const parts = name.trim().split(/\s+/)
  const last = parts.length > 1 ? parts.at(-1) : undefined
  return last === undefined ? (parts[0] ?? "") : `${parts[0]} ${last.charAt(0).toUpperCase()}.`
}

function toSummary(request: MockLgpdRequest): AdminLgpdRequestSummary {
  return {
    id: request.id,
    protocolo: request.protocolo,
    tipo: request.tipo,
    status: request.status,
    nomeMascarado: maskRequesterName(request.nome),
    prazoEm: request.prazoEm,
    vencida: !isFinal(request.status) && new Date(request.prazoEm).getTime() < Date.now(),
    anonimizadaEm: request.anonimizadaEm,
    criadoEm: request.criadoEm,
    atualizadoEm: request.atualizadoEm,
  }
}

function toStatus(request: MockLgpdRequest): AdminLgpdRequestStatus {
  return { ...toSummary(request), resposta: request.resposta, encerradaEm: request.encerradaEm }
}

function toDetail(request: MockLgpdRequest): AdminLgpdRequest {
  return {
    ...toStatus(request),
    nome: request.nome,
    cpfMascarado: maskCpf(request.cpf),
    email: request.email,
    whatsapp: request.whatsapp,
    mensagem: request.mensagem,
    aceiteEm: request.aceiteEm,
    atualizadoPor: request.atualizadoPor,
  }
}

function findRequest(ctx: MockContext): MockLgpdRequest | Response {
  const id = paramId(ctx)
  if (id === null) return invalidId("id")
  return getMockDb().lgpdRequests.find((request) => request.id === id) ?? notFound("Solicitação")
}

function holderRegistrations(cpf: string): MockRegistration[] {
  return getMockDb().registrations.filter((registration) => registration.cpf === cpf)
}

/** `exportar_dados_titular` (migration 0021): tudo ligado ao CPF, sem CPF nem tokens. */
function buildHolderData(cpf: string) {
  const db = getMockDb()
  const registrations = holderRegistrations(cpf)
  return {
    atletas: registrations.slice(0, 1).map((registration) => ({
      id: registration.id,
      nomeCompleto: registration.nomeCompleto,
      dataNascimento: registration.dataNascimento,
      email: registration.email,
      whatsapp: registration.whatsapp,
      anonimizadoEm: null,
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

function touch(request: MockLgpdRequest, adminId: number) {
  request.atualizadoPor = adminId
  request.atualizadoEm = new Date().toISOString()
}

export const lgpdRoutes: MockRoute[] = [
  {
    // Público: sempre 201 com protocolo, exista ou não o CPF (sem oráculo).
    method: "POST",
    path: "/lgpd/solicitacoes",
    handler: (ctx) => {
      const input = validate(lgpdRequestSchema, ctx.body)
      if (input instanceof Response) return input
      const db = getMockDb()
      const now = new Date()
      const id = nextId(db.lgpdRequests)
      const request: MockLgpdRequest = {
        id,
        protocolo: lgpdProtocol(id, now),
        tipo: input.tipo,
        status: LGPD_REQUEST_STATUS.OPEN,
        nome: input.nome.replace(/\s+/g, " "),
        cpf: input.cpf.replace(/\D/g, ""),
        email: input.email?.toLowerCase() ?? null,
        whatsapp: input.whatsapp ?? null,
        mensagem: input.mensagem || null,
        resposta: null,
        aceiteEm: now.toISOString(),
        prazoEm: addDays(now, LGPD_RESPONSE_DAYS).toISOString(),
        encerradaEm: null,
        anonimizadaEm: null,
        atualizadoPor: null,
        criadoEm: now.toISOString(),
        atualizadoEm: now.toISOString(),
      }
      db.lgpdRequests.push(request)
      return json(201, { protocolo: request.protocolo, status: request.status, prazoEm: request.prazoEm })
    },
  },
  {
    method: "GET",
    path: "/admin/lgpd/solicitacoes",
    handler: withAdmin((ctx) => {
      const query = validate(lgpdListQuerySchema, Object.fromEntries(ctx.query))
      if (query instanceof Response) return query
      const items = getMockDb()
        .lgpdRequests.filter((request) => (!query.status || request.status === query.status) && (!query.tipo || request.tipo === query.tipo))
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm) || b.id - a.id)
      const page = paginate(items, ctx.query, (request) => request.id, toSummary)
      return page instanceof Response ? page : json(200, page)
    }),
  },
  {
    // Dados do requerente: o backend grava `visualizar_pii` e `acesso_dado_pessoal`.
    method: "GET",
    path: "/admin/lgpd/solicitacoes/:id",
    handler: withAdmin((ctx, admin) => {
      const request = findRequest(ctx)
      if (request instanceof Response) return request
      recordAudit(admin, { acao: "visualizar_pii", entidade: ENTITY, entidadeId: request.id })
      return json(200, toDetail(request))
    }),
  },
  {
    method: "PATCH",
    path: "/admin/lgpd/solicitacoes/:id",
    handler: withAdmin((ctx, admin) => {
      const request = findRequest(ctx)
      if (request instanceof Response) return request
      const input = validate(lgpdStatusSchema, ctx.body)
      if (input instanceof Response) return input
      const resposta = input.resposta || null
      if (isFinal(input.status) && resposta === null) {
        return apiError(422, API_ERROR_CODE.INVALID_DATA, "resposta: Informe a resposta ao titular para concluir ou recusar a solicitação.")
      }
      if (!canTransition(request.status, input.status)) {
        return apiError(409, API_ERROR_CODE.STATE_CONFLICT, `A solicitação não pode passar de ${request.status} para ${input.status}.`)
      }
      request.status = input.status
      request.resposta = resposta ?? request.resposta
      request.encerradaEm = isFinal(input.status) ? new Date().toISOString() : null
      touch(request, admin.id)
      recordAudit(admin, { acao: "atualizar", entidade: ENTITY, entidadeId: request.id })
      return json(200, toStatus(request))
    }),
  },
  {
    method: "POST",
    path: "/admin/lgpd/solicitacoes/:id/exportar",
    handler: withAdmin((ctx, admin) => {
      const request = findRequest(ctx)
      if (request instanceof Response) return request
      recordAudit(admin, { acao: "exportar", entidade: ENTITY, entidadeId: request.id })
      return json(
        200,
        { protocolo: request.protocolo, geradoEm: new Date().toISOString(), titular: buildHolderData(request.cpf) },
        { headers: new Headers({ "Content-Disposition": `attachment; filename="lgpd-${request.protocolo}.json"` }) },
      )
    }),
  },
  {
    // Irreversível e idempotente (o que já foi anonimizado não conta de novo). Só eliminação não recusada.
    method: "POST",
    path: "/admin/lgpd/solicitacoes/:id/anonimizar",
    handler: withAdmin((ctx, admin) => {
      const request = findRequest(ctx)
      if (request instanceof Response) return request
      const body = validate(lgpdAnonymizeSchema, ctx.body)
      if (body instanceof Response) return body
      if (request.tipo !== LGPD_REQUEST_TYPE.DELETION) {
        return apiError(409, API_ERROR_CODE.STATE_CONFLICT, "Só solicitações de eliminação podem anonimizar os dados do titular.")
      }
      if (request.status === LGPD_REQUEST_STATUS.REJECTED) {
        return apiError(409, API_ERROR_CODE.STATE_CONFLICT, "A solicitação foi recusada; abra uma nova para anonimizar.")
      }
      const registrations = holderRegistrations(request.cpf).filter((registration) => registration.nomeCompleto !== ANONYMIZED_NAME)
      if (registrations.some((registration) => registration.status === REGISTRATION_STATUS.PENDING)) {
        return apiError(
          409,
          API_ERROR_CODE.STATE_CONFLICT,
          "O titular tem inscrição ou pedido aguardando pagamento. Aguarde a expiração ou cancele antes de anonimizar.",
        )
      }
      // O hash do CPF fica (pseudônimo): a inscrição continua ligada ao titular, sem nome nem contatos.
      for (const registration of registrations) {
        Object.assign(registration, { nomeCompleto: ANONYMIZED_NAME, whatsapp: null, email: null })
      }
      request.anonimizadaEm ??= new Date().toISOString()
      touch(request, admin.id)
      recordAudit(admin, { acao: "anonimizar", entidade: ENTITY, entidadeId: request.id })
      const result: LgpdAnonymizationResult = {
        protocolo: request.protocolo,
        anonimizadaEm: request.anonimizadaEm,
        atletas: registrations.length > 0 ? 1 : 0,
        inscricoes: registrations.length,
        pedidos: 0,
        notificacoes: 0,
      }
      return json(200, result)
    }),
  },
]
