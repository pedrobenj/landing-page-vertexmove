import "server-only"

import { z } from "zod"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import { maskCpf } from "@/lib/utils/masks"
import type { ApiAdminRegistration, ApiAdminRegistrationDetails } from "@/types/api/admin-registration.interface"

import { getMockDb, recordAudit } from "../mock-db"
import { invalidId, notFound, paramId, withAdmin } from "../mock-guards"
import { apiError, json, noContent, type MockRoute } from "../mock-http"
import { paginate } from "../mock-pagination"
import { toFortalezaIso } from "../mock-time"
import type { MockPayment, MockRegistration } from "../mock-types"

const listQuerySchema = z.object({
  status: z.enum(REGISTRATION_STATUS).optional(),
  distanciaId: z.coerce.number().int().positive().optional(),
  busca: z.string().trim().max(100).optional(),
})

const CSV_HEADER = ["Código", "Nome", "Distância", "Kit", "Tamanho", "Status", "WhatsApp", "E-mail", "Nascimento", "Retirada"]

/** Busca sem acento e sem caixa (como `unaccent(lower(...))` no Postgres). */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
}

function findPayment(registration: MockRegistration): MockPayment | undefined {
  return getMockDb()
    .payments.filter((payment) => payment.inscricaoId === registration.id)
    .sort((a, b) => b.id - a.id)[0]
}

function toListItem(registration: MockRegistration): ApiAdminRegistration {
  const db = getMockDb()
  const payment = findPayment(registration)
  return {
    id: registration.id,
    codigo: registration.codigo,
    nomeCompleto: registration.nomeCompleto,
    cpfMascarado: registration.cpf ? maskCpf(registration.cpf) : null,
    distancia: db.distances.find((item) => item.id === registration.distanciaId)?.nome ?? "",
    kit: db.kits.find((item) => item.id === registration.kitId)?.nome ?? null,
    tamanhoCamisa: db.shirtSizes.find((item) => item.id === registration.tamanhoCamisaId)?.codigo ?? null,
    status: registration.status,
    valorTotalCentavos: registration.valorTotalCentavos,
    inscritoEm: registration.inscritoEm,
    kitRetiradoEm: registration.kitRetiradoEm ?? null,
    // Inscrições criadas pelo site no mock só têm o status do checkout falso (id = id da inscrição).
    pagamento: payment
      ? { id: payment.id, status: payment.status }
      : registration.pagamentoStatus
        ? { id: registration.id, status: registration.pagamentoStatus }
        : null,
  }
}

function toDetails(registration: MockRegistration): ApiAdminRegistrationDetails {
  const db = getMockDb()
  const event = db.events.find((item) => item.id === registration.eventoId)
  return {
    ...toListItem(registration),
    eventoId: registration.eventoId,
    evento: event?.nome ?? "",
    dataNascimento: registration.dataNascimento,
    whatsapp: registration.whatsapp,
    email: registration.email,
    valorBaseCentavos: registration.valorBaseCentavos,
    valorDescontoCentavos: registration.valorDescontoCentavos,
    expiraEm: registration.status === REGISTRATION_STATUS.PENDING ? toFortalezaIso(new Date(Date.parse(registration.inscritoEm) + 30 * 60_000)) : null,
    aceites: registration.documentosAceitos.flatMap((documentoId) => {
      const document = db.documents.find((item) => item.id === documentoId)
      return document ? [{ documentoId, tipo: document.tipo, versao: document.versao, aceitoEm: registration.inscritoEm }] : []
    }),
    historico: registration.historico ?? [{ status: REGISTRATION_STATUS.PENDING, em: registration.inscritoEm }],
    pagamentos: db.payments
      .filter((payment) => payment.inscricaoId === registration.id)
      .map((payment) => ({
        id: payment.id,
        status: payment.status,
        valorCentavos: payment.valorCentavos,
        criadoEm: payment.criadoEm,
        pagoEm: payment.pagoEm,
        estornoSolicitadoEm: payment.estornoSolicitadoEm,
      })),
  }
}

function findById(id: number): MockRegistration | undefined {
  return getMockDb().registrations.find((item) => item.id === id)
}

/** Muda o status e guarda no histórico (o backend grava `inscricao_status_historico`). */
export function changeRegistrationStatus(registration: MockRegistration, status: REGISTRATION_STATUS): void {
  const now = toFortalezaIso(new Date())
  registration.historico = [...(registration.historico ?? [{ status: registration.status, em: registration.inscritoEm }]), { status, em: now }]
  registration.status = status
}

/** Célula do CSV: neutraliza fórmula (`= + - @`) e escapa `;`, aspas e quebras. */
function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
  return /[;"\r\n]/.test(safe) || safe !== value ? `"${safe.replaceAll('"', '""')}"` : safe
}

function toCsvRow(registration: MockRegistration): string {
  const item = toListItem(registration)
  return [
    item.codigo,
    item.nomeCompleto,
    item.distancia,
    item.kit ?? "",
    item.tamanhoCamisa ?? "",
    item.status,
    registration.whatsapp ?? "",
    registration.email ?? "",
    registration.dataNascimento,
    item.kitRetiradoEm ?? "",
  ]
    .map(csvCell)
    .join(";")
}

function eventRegistrations(eventId: number): MockRegistration[] {
  return getMockDb()
    .registrations.filter((item) => item.eventoId === eventId)
    .sort((a, b) => b.id - a.id)
}

function findEvent(eventId: number) {
  return getMockDb().events.find((item) => item.id === eventId && !item.deletedAt)
}

export const adminRegistrationRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/admin/eventos/:eventoId/inscricoes.csv",
    handler: withAdmin((ctx, admin) => {
      const eventId = paramId(ctx, "eventoId")
      if (eventId === null) return invalidId("eventoId")
      if (!findEvent(eventId)) return notFound("Evento")
      recordAudit(admin, { acao: "exportar", entidade: "inscricao", entidadeId: eventId })
      const rows = [CSV_HEADER.join(";"), ...eventRegistrations(eventId).map(toCsvRow)]
      return new Response(`﻿${rows.join("\r\n")}\r\n`, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="inscricoes-evento-${eventId}.csv"`,
        },
      })
    }),
  },
  {
    method: "GET",
    path: "/admin/eventos/:eventoId/inscricoes",
    handler: withAdmin((ctx) => {
      const eventId = paramId(ctx, "eventoId")
      if (eventId === null) return invalidId("eventoId")
      if (!findEvent(eventId)) return notFound("Evento")
      const filters = listQuerySchema.safeParse(Object.fromEntries(["status", "distanciaId", "busca"].flatMap((key) => {
        const value = ctx.query.get(key)
        return value === null ? [] : [[key, value]]
      })))
      if (!filters.success) return apiError(422, API_ERROR_CODE.INVALID_DATA, "Filtro inválido.")
      const { status, distanciaId, busca } = filters.data
      const term = busca ? normalize(busca) : ""
      const items = eventRegistrations(eventId).filter(
        (item) =>
          (!status || item.status === status) &&
          (!distanciaId || item.distanciaId === distanciaId) &&
          (!term || normalize(item.nomeCompleto).includes(term) || normalize(item.codigo).includes(term)),
      )
      const page = paginate(items, ctx.query, (item) => item.id, toListItem)
      return page instanceof Response ? page : json(200, page)
    }),
  },
  {
    method: "GET",
    path: "/admin/inscricoes/:id",
    handler: withAdmin((ctx) => {
      const id = paramId(ctx)
      if (id === null) return invalidId("id")
      const registration = findById(id)
      return registration ? json(200, toDetails(registration)) : notFound("Inscrição")
    }),
  },
  {
    method: "POST",
    path: "/admin/inscricoes/:id/retirada-kit",
    handler: withAdmin((ctx, admin) => {
      const id = paramId(ctx)
      if (id === null) return invalidId("id")
      const registration = findById(id)
      if (!registration) return notFound("Inscrição")
      if (registration.status !== REGISTRATION_STATUS.CONFIRMED) {
        return apiError(409, API_ERROR_CODE.STATE_CONFLICT, "Só inscrição confirmada pode retirar o kit.")
      }
      if (!registration.kitRetiradoEm) {
        registration.kitRetiradoEm = toFortalezaIso(new Date())
        recordAudit(admin, { acao: "atualizar", entidade: "inscricao", entidadeId: id })
      }
      return noContent()
    }),
  },
  {
    method: "DELETE",
    path: "/admin/inscricoes/:id/retirada-kit",
    handler: withAdmin((ctx, admin) => {
      const id = paramId(ctx)
      if (id === null) return invalidId("id")
      const registration = findById(id)
      if (!registration) return notFound("Inscrição")
      if (registration.kitRetiradoEm) {
        registration.kitRetiradoEm = null
        recordAudit(admin, { acao: "atualizar", entidade: "inscricao", entidadeId: id })
      }
      return noContent()
    }),
  },
  {
    method: "POST",
    path: "/admin/inscricoes/:id/cancelar",
    handler: withAdmin((ctx, admin) => {
      const id = paramId(ctx)
      if (id === null) return invalidId("id")
      const registration = findById(id)
      if (!registration) return notFound("Inscrição")
      if (registration.status !== REGISTRATION_STATUS.PENDING && registration.status !== REGISTRATION_STATUS.CONFIRMED) {
        return apiError(409, API_ERROR_CODE.STATE_CONFLICT, "A inscrição não pode ser cancelada no status atual.")
      }
      changeRegistrationStatus(registration, REGISTRATION_STATUS.CANCELLED)
      const now = toFortalezaIso(new Date())
      for (const payment of getMockDb().payments.filter((item) => item.inscricaoId === id)) {
        if (payment.status === PAYMENT_STATUS.APPROVED) {
          // Estorno sinalizado: o worker (ou o admin, na fila de pagamentos) executa.
          payment.estornoSolicitadoEm = now
          payment.estornoMotivo = "Inscrição cancelada pelo admin"
          payment.atualizadoEm = now
        } else if (payment.status === PAYMENT_STATUS.PENDING || payment.status === PAYMENT_STATUS.CREATED) {
          payment.status = PAYMENT_STATUS.CANCELLED
          payment.atualizadoEm = now
        }
      }
      recordAudit(admin, { acao: "cancelar", entidade: "inscricao", entidadeId: id })
      return noContent()
    }),
  },
]
