import "server-only"

import { z } from "zod"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type {
  ApiAdminRegistration,
  ApiAdminRegistrationDetails,
  ApiCancelledRegistration,
  ApiKitPickup,
} from "@/types/api/admin-registration.interface"

import { getMockDb, recordAudit } from "../mock-db"
import { invalidId, notFound, paramId, withAdmin } from "../mock-guards"
import { apiError, json, noContent, type MockRoute } from "../mock-http"
import { paginate } from "../mock-pagination"
import { validate } from "../mock-schemas"
import type { MockAdmin, MockPayment, MockRegistration, MockStatusChange } from "../mock-types"

// Contrato do backend (fase 5): `admin-inscricoes.controller.ts` e `inscricao-admin.presenter.ts`.

/** O backend não decifra o CPF (`app_vertex` sem SELECT na cifra): máscara fixa quando há CPF. */
const CPF_MASKED = "***.***.***-**"
const REGISTRATION_CODE = /^VX-\d{4}-\d{8}$/i
const HOLD_MS = 30 * 60_000

const id = z.coerce.number().int().positive()
const listQuerySchema = z.strictObject({
  status: z.enum(REGISTRATION_STATUS).optional(),
  distanciaId: id.optional(),
  busca: z.string().trim().min(1).max(100).optional(),
  cursor: z.string().min(1).max(256).optional(),
  limit: z.string().optional(),
})
const exportQuerySchema = z.strictObject({ status: z.enum(REGISTRATION_STATUS).optional(), distanciaId: id.optional() })
const cancelSchema = z.strictObject({ motivo: z.string().trim().min(1, "é obrigatório").max(500) })

const CSV_HEADER = ["Código", "Nome", "Distância", "Kit", "Tamanho", "Status", "WhatsApp", "E-mail", "Nascimento", "Kit retirado em"]
const CSV_DATE_TIME = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Fortaleza",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

/** Instantes em ISO-8601 UTC, como o backend (`toISOString()`). */
function utc(value: string | number | Date): string {
  return new Date(value).toISOString()
}

function nullableUtc(value: string | null | undefined): string | null {
  return value ? utc(value) : null
}

/**
 * Pagamentos da inscrição. As criadas pelo site no mock só têm o status do checkout falso: na primeira
 * leitura do admin vira uma linha de `pagamento` (id = id da inscrição), como no backend.
 */
function paymentsOf(registration: MockRegistration): MockPayment[] {
  const db = getMockDb()
  const payments = db.payments.filter((payment) => payment.inscricaoId === registration.id)
  if (payments.length > 0 || !registration.pagamentoStatus) return payments
  const approved = registration.pagamentoStatus === PAYMENT_STATUS.APPROVED
  const now = new Date().toISOString()
  const payment: MockPayment = {
    id: registration.id,
    inscricaoId: registration.id,
    pedidoLojaCodigo: null,
    status: registration.pagamentoStatus,
    valorCentavos: registration.valorTotalCentavos,
    valorGatewayCentavos: approved ? registration.valorTotalCentavos : null,
    gatewayPaymentId: approved ? String(800_000 + registration.id) : null,
    gatewayStatus: approved ? "approved" : null,
    metodo: approved ? "bank_transfer" : null,
    criadoEm: registration.inscritoEm,
    atualizadoEm: now,
    pagoEm: approved ? now : null,
    estornoSolicitadoEm: null,
    estornoMotivo: null,
  }
  db.payments.push(payment)
  return [payment]
}

/** O aprovado, se houver; senão a tentativa mais recente. */
function mainPayment(registration: MockRegistration): MockPayment | undefined {
  const payments = paymentsOf(registration).sort((a, b) => b.id - a.id)
  return payments.find((payment) => payment.status === PAYMENT_STATUS.APPROVED) ?? payments[0]
}

function expiresAt(registration: MockRegistration): number {
  return Date.parse(registration.inscritoEm) + HOLD_MS
}

/** Status efetivo: pendente com a reserva vencida aparece como `expirada` (também no filtro). */
function effectiveStatus(registration: MockRegistration): REGISTRATION_STATUS {
  return registration.status === REGISTRATION_STATUS.PENDING && Date.now() >= expiresAt(registration)
    ? REGISTRATION_STATUS.EXPIRED
    : registration.status
}

function base(registration: MockRegistration): Omit<ApiAdminRegistration, "pagamento"> {
  const db = getMockDb()
  const distance = db.distances.find((item) => item.id === registration.distanciaId)
  const kit = db.kits.find((item) => item.id === registration.kitId)
  return {
    id: registration.id,
    codigo: registration.codigo,
    nomeCompleto: registration.nomeCompleto,
    cpfMascarado: registration.cpf ? CPF_MASKED : null,
    distancia: { id: registration.distanciaId, nome: distance?.nome ?? "" },
    kit: kit ? { id: kit.id, nome: kit.nome } : null,
    tamanhoCamisa: db.shirtSizes.find((item) => item.id === registration.tamanhoCamisaId)?.codigo ?? null,
    status: effectiveStatus(registration),
    valorTotalCentavos: registration.valorTotalCentavos,
    inscritoEm: utc(registration.inscritoEm),
    kitRetiradoEm: nullableUtc(registration.kitRetiradoEm),
  }
}

function toListItem(registration: MockRegistration): ApiAdminRegistration {
  const payment = mainPayment(registration)
  return { ...base(registration), pagamento: payment ? { id: payment.id, status: payment.status } : null }
}

function historyOf(registration: MockRegistration): MockStatusChange[] {
  return (
    registration.historico ?? [
      { statusAnterior: null, statusNovo: REGISTRATION_STATUS.PENDING, origem: "atleta", motivo: "inscricao_criada", em: registration.inscritoEm },
    ]
  )
}

function toDetails(registration: MockRegistration): ApiAdminRegistrationDetails {
  const db = getMockDb()
  const event = db.events.find((item) => item.id === registration.eventoId)
  return {
    ...base(registration),
    evento: { id: registration.eventoId, nome: event?.nome ?? "" },
    email: registration.email,
    whatsapp: registration.whatsapp,
    dataNascimento: registration.dataNascimento,
    valorBaseCentavos: registration.valorBaseCentavos,
    valorDescontoCentavos: registration.valorDescontoCentavos,
    expiraEm: utc(expiresAt(registration)),
    confirmadaEm: nullableUtc(registration.confirmadaEm),
    encerradaEm: nullableUtc(registration.encerradaEm),
    motivoEncerramento: registration.motivoEncerramento ?? null,
    kitRetiradoPor: registration.kitRetiradoPor ?? null,
    anonimizado: false,
    aceites: registration.documentosAceitos.flatMap((documentoId) => {
      const document = db.documents.find((item) => item.id === documentoId)
      return document
        ? [{ documentoTipo: document.tipo, documentoVersao: document.versao, documentoTitulo: document.titulo, aceitoEm: utc(registration.inscritoEm) }]
        : []
    }),
    historico: historyOf(registration).map((change) => ({ ...change, em: utc(change.em) })),
    pagamentos: paymentsOf(registration).map((payment) => ({
      id: payment.id,
      status: payment.status,
      valorCentavos: payment.valorCentavos,
      metodo: payment.metodo,
      criadoEm: utc(payment.criadoEm),
      pagoEm: nullableUtc(payment.pagoEm),
      estornoSolicitadoEm: nullableUtc(payment.estornoSolicitadoEm),
      estornoMotivo: payment.estornoMotivo,
    })),
  }
}

function findById(registrationId: number): MockRegistration | undefined {
  return getMockDb().registrations.find((item) => item.id === registrationId)
}

/** Muda o status e grava no histórico (o backend grava `inscricao_status_historico`). */
export function changeRegistrationStatus(
  registration: MockRegistration,
  status: REGISTRATION_STATUS,
  change: { origem: MockStatusChange["origem"]; motivo: string | null },
): void {
  const em = new Date().toISOString()
  registration.historico = [...historyOf(registration), { statusAnterior: registration.status, statusNovo: status, ...change, em }]
  registration.status = status
  if (status === REGISTRATION_STATUS.CONFIRMED) registration.confirmadaEm = em
  else {
    registration.encerradaEm = em
    registration.motivoEncerramento = change.motivo
  }
}

/** Célula do CSV: neutraliza fórmula (`= + - @`, TAB, CR) e aplica as aspas do RFC 4180. */
function csvCell(value: string | null): string {
  if (!value) return ""
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[;"\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe
}

function toCsvRow(registration: MockRegistration): string {
  const item = base(registration)
  const [year, month, day] = registration.dataNascimento.split("-")
  return [
    item.codigo,
    item.nomeCompleto,
    item.distancia.nome,
    item.kit?.nome ?? null,
    item.tamanhoCamisa,
    item.status,
    registration.whatsapp,
    registration.email,
    `${day}/${month}/${year}`,
    item.kitRetiradoEm ? CSV_DATE_TIME.format(new Date(item.kitRetiradoEm)).replace(",", "") : null,
  ]
    .map(csvCell)
    .join(";")
}

function eventRegistrations(eventId: number, filters: { status?: REGISTRATION_STATUS; distanciaId?: number }): MockRegistration[] {
  return getMockDb().registrations.filter(
    (item) =>
      item.eventoId === eventId &&
      (!filters.status || effectiveStatus(item) === filters.status) &&
      (!filters.distanciaId || item.distanciaId === filters.distanciaId),
  )
}

function findEvent(eventId: number) {
  return getMockDb().events.find((item) => item.id === eventId && !item.deletedAt)
}

function queryObject(query: URLSearchParams): Record<string, string> {
  return Object.fromEntries(query.entries())
}

/** Busca: código `VX-AAAA-NNNNNNNN` exato (sem caixa) ou trecho do nome (ILIKE: sem caixa, com acento). */
function matchesSearch(registration: MockRegistration, busca: string | undefined): boolean {
  if (!busca) return true
  if (REGISTRATION_CODE.test(busca)) return registration.codigo.toUpperCase() === busca.toUpperCase()
  return registration.nomeCompleto.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"))
}

function withRegistration(handler: (registration: MockRegistration, admin: MockAdmin, body: unknown) => Response) {
  return withAdmin((ctx, admin) => {
    const registrationId = paramId(ctx)
    if (registrationId === null) return invalidId("id")
    const registration = findById(registrationId)
    return registration ? handler(registration, admin, ctx.body) : notFound("Inscrição")
  })
}

export const adminRegistrationRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/admin/eventos/:eventoId/inscricoes.csv",
    handler: withAdmin((ctx, admin) => {
      const eventId = paramId(ctx, "eventoId")
      if (eventId === null) return invalidId("eventoId")
      const filters = exportQuerySchema.safeParse(queryObject(ctx.query))
      if (!filters.success) return apiError(422, API_ERROR_CODE.INVALID_DATA, "Filtro inválido.")
      if (!findEvent(eventId)) return notFound("Evento")
      recordAudit(admin, { acao: "exportar", entidade: "evento", entidadeId: eventId })
      const rows = eventRegistrations(eventId, filters.data)
        .sort((a, b) => a.id - b.id)
        .map(toCsvRow)
      return new Response(`﻿${[CSV_HEADER.join(";"), ...rows].join("\r\n")}\r\n`, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="inscritos-evento-${eventId}.csv"`,
          "Cache-Control": "no-store",
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
      const filters = listQuerySchema.safeParse(queryObject(ctx.query))
      if (!filters.success) return apiError(422, API_ERROR_CODE.INVALID_DATA, "Filtro inválido.")
      if (!findEvent(eventId)) return notFound("Evento")
      const items = eventRegistrations(eventId, filters.data)
        .filter((item) => matchesSearch(item, filters.data.busca))
        .sort((a, b) => b.id - a.id)
      const page = paginate(items, ctx.query, (item) => item.id, toListItem)
      return page instanceof Response ? page : json(200, page)
    }),
  },
  {
    method: "GET",
    path: "/admin/inscricoes/:id",
    handler: withRegistration((registration, admin) => {
      recordAudit(admin, { acao: "visualizar_pii", entidade: "inscricao", entidadeId: registration.id })
      return json(200, toDetails(registration))
    }),
  },
  {
    method: "POST",
    path: "/admin/inscricoes/:id/retirada-kit",
    handler: withRegistration((registration, admin) => {
      if (effectiveStatus(registration) !== REGISTRATION_STATUS.CONFIRMED) {
        return apiError(409, API_ERROR_CODE.STATE_CONFLICT, "Só inscrições confirmadas podem retirar o kit.")
      }
      if (!registration.kitRetiradoEm) {
        registration.kitRetiradoEm = new Date().toISOString()
        registration.kitRetiradoPor = admin.id
        recordAudit(admin, { acao: "atualizar", entidade: "inscricao", entidadeId: registration.id })
      }
      const body: ApiKitPickup = { id: registration.id, kitRetiradoEm: utc(registration.kitRetiradoEm) }
      return json(200, body)
    }),
  },
  {
    method: "DELETE",
    path: "/admin/inscricoes/:id/retirada-kit",
    handler: withRegistration((registration, admin) => {
      if (registration.kitRetiradoEm) {
        registration.kitRetiradoEm = null
        registration.kitRetiradoPor = null
        recordAudit(admin, { acao: "atualizar", entidade: "inscricao", entidadeId: registration.id })
      }
      return noContent()
    }),
  },
  {
    method: "POST",
    path: "/admin/inscricoes/:id/cancelar",
    handler: withRegistration((registration, admin, body) => {
      const input = validate(cancelSchema, body)
      if (input instanceof Response) return input
      const current = effectiveStatus(registration)
      if (current === REGISTRATION_STATUS.CANCELLED) {
        const idempotent: ApiCancelledRegistration = { id: registration.id, status: "cancelada", statusAnterior: null, estornoSinalizado: false, pagamentoId: null }
        return json(200, idempotent)
      }
      if (current !== REGISTRATION_STATUS.PENDING && current !== REGISTRATION_STATUS.CONFIRMED) {
        return apiError(409, API_ERROR_CODE.STATE_CONFLICT, "Só inscrições pendentes ou confirmadas podem ser canceladas.")
      }
      changeRegistrationStatus(registration, REGISTRATION_STATUS.CANCELLED, { origem: "admin", motivo: input.motivo })
      // Confirmada com pagamento aprovado: o estorno é sinalizado; o worker (ou o admin, na fila) executa.
      const approved = current === REGISTRATION_STATUS.CONFIRMED ? paymentsOf(registration).find((item) => item.status === PAYMENT_STATUS.APPROVED) : undefined
      if (approved) {
        const now = new Date().toISOString()
        approved.estornoSolicitadoEm = now
        approved.estornoMotivo = "cancelamento_admin"
        approved.atualizadoEm = now
      }
      recordAudit(admin, { acao: "atualizar", entidade: "inscricao", entidadeId: registration.id })
      const response: ApiCancelledRegistration = {
        id: registration.id,
        status: "cancelada",
        statusAnterior: current,
        estornoSinalizado: Boolean(approved),
        pagamentoId: approved?.id ?? null,
      }
      return json(200, response)
    }),
  },
]
