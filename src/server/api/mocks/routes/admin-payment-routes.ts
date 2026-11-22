import "server-only"

import { z } from "zod"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { PAYMENT_ISSUE } from "@/enums/payment-issue.enum"
import { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { ApiAdminPayment } from "@/types/api/admin-payment.interface"

import { getMockDb, recordAudit } from "../mock-db"
import { invalidId, paramId, withAdmin } from "../mock-guards"
import { apiError, json, noContent, type MockRoute } from "../mock-http"
import { paginate } from "../mock-pagination"
import { validate } from "../mock-schemas"
import { toFortalezaIso } from "../mock-time"
import type { MockPayment } from "../mock-types"
import { changeRegistrationStatus } from "./admin-registration-routes"

const refundSchema = z.strictObject({ motivo: z.string().trim().min(1, "é obrigatório").max(500) })

/** Situação que coloca o pagamento na fila do admin (`null` = sem pendência). */
function issueOf(payment: MockPayment): PAYMENT_ISSUE | null {
  if (payment.estornoSolicitadoEm && payment.status !== PAYMENT_STATUS.REFUNDED) return PAYMENT_ISSUE.REFUND_PENDING
  if (payment.status === PAYMENT_STATUS.UNDER_REVIEW) return PAYMENT_ISSUE.UNDER_REVIEW
  const mismatch = payment.valorGatewayCentavos !== null && payment.valorGatewayCentavos !== payment.valorCentavos
  if (mismatch && payment.status === PAYMENT_STATUS.APPROVED) return PAYMENT_ISSUE.MISMATCH
  return null
}

function toAdminPayment(payment: MockPayment): ApiAdminPayment {
  const registration = getMockDb().registrations.find((item) => item.id === payment.inscricaoId)
  return {
    id: payment.id,
    status: payment.status,
    situacao: issueOf(payment) ?? PAYMENT_ISSUE.UNDER_REVIEW,
    valorCentavos: payment.valorCentavos,
    valorGatewayCentavos: payment.valorGatewayCentavos,
    criadoEm: payment.criadoEm,
    atualizadoEm: payment.atualizadoEm,
    estornoSolicitadoEm: payment.estornoSolicitadoEm,
    estornoMotivo: payment.estornoMotivo,
    inscricao: registration ? { id: registration.id, codigo: registration.codigo, eventoId: registration.eventoId } : null,
    pedidoLoja: payment.pedidoLojaCodigo ? { codigo: payment.pedidoLojaCodigo } : null,
  }
}

function paymentNotFound(): Response {
  return apiError(404, API_ERROR_CODE.PAYMENT_NOT_FOUND, "Pagamento não encontrado.")
}

function findRegistration(payment: MockPayment) {
  return getMockDb().registrations.find((item) => item.id === payment.inscricaoId)
}

/** Estorno executado: pagamento estornado e, se a inscrição estava confirmada, ela vira estornada. */
function applyRefund(payment: MockPayment, motivo: string): void {
  const now = toFortalezaIso(new Date())
  const registration = findRegistration(payment)
  if (payment.status === PAYMENT_STATUS.APPROVED && registration?.status === REGISTRATION_STATUS.CONFIRMED) {
    changeRegistrationStatus(registration, REGISTRATION_STATUS.REFUNDED)
    if (registration) registration.pagamentoStatus = PAYMENT_STATUS.REFUNDED
  }
  payment.status = PAYMENT_STATUS.REFUNDED
  payment.estornoMotivo = motivo
  payment.atualizadoEm = now
}

export const adminPaymentRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/admin/pagamentos",
    handler: withAdmin((ctx) => {
      const situacao = ctx.query.get("situacao")
      if (situacao !== null && !Object.values<string>(PAYMENT_ISSUE).includes(situacao)) {
        return apiError(422, API_ERROR_CODE.INVALID_DATA, "situacao inválida.")
      }
      const items = getMockDb()
        .payments.filter((payment) => {
          const issue = issueOf(payment)
          return issue !== null && (situacao === null || issue === situacao)
        })
        .sort((a, b) => b.id - a.id)
      const page = paginate(items, ctx.query, (payment) => payment.id, toAdminPayment)
      return page instanceof Response ? page : json(200, page)
    }),
  },
  {
    // Simula a consulta ao Mercado Pago: em análise → aprovado; estorno pendente → estornado; divergência → valor acertado.
    method: "POST",
    path: "/admin/pagamentos/:id/conciliar",
    handler: withAdmin((ctx, admin) => {
      const id = paramId(ctx)
      if (id === null) return invalidId("pagamentoId")
      const payment = getMockDb().payments.find((item) => item.id === id)
      if (!payment) return paymentNotFound()
      const issue = issueOf(payment)
      const now = toFortalezaIso(new Date())
      if (issue === PAYMENT_ISSUE.REFUND_PENDING) {
        applyRefund(payment, payment.estornoMotivo ?? "Estorno conciliado")
      } else if (issue === PAYMENT_ISSUE.UNDER_REVIEW) {
        payment.status = PAYMENT_STATUS.APPROVED
        payment.pagoEm = now
        payment.valorGatewayCentavos = payment.valorCentavos
        payment.atualizadoEm = now
        const registration = findRegistration(payment)
        if (registration?.status === REGISTRATION_STATUS.PENDING) {
          changeRegistrationStatus(registration, REGISTRATION_STATUS.CONFIRMED)
          registration.pagamentoStatus = PAYMENT_STATUS.APPROVED
        }
      } else if (issue === PAYMENT_ISSUE.MISMATCH) {
        payment.valorGatewayCentavos = payment.valorCentavos
        payment.atualizadoEm = now
      }
      recordAudit(admin, { acao: "atualizar", entidade: "pagamento", entidadeId: id })
      return noContent()
    }),
  },
  {
    method: "POST",
    path: "/admin/pagamentos/:id/estornar",
    handler: withAdmin((ctx, admin) => {
      const id = paramId(ctx)
      if (id === null) return invalidId("pagamentoId")
      const input = validate(refundSchema, ctx.body)
      if (input instanceof Response) return input
      const payment = getMockDb().payments.find((item) => item.id === id)
      if (!payment) return paymentNotFound()
      // Como o backend: aprovado, ou em análise já sinalizado para estorno (segunda captura).
      const refundable =
        payment.status === PAYMENT_STATUS.APPROVED ||
        (payment.status === PAYMENT_STATUS.UNDER_REVIEW && payment.estornoSolicitadoEm !== null)
      if (!refundable) return apiError(409, API_ERROR_CODE.STATE_CONFLICT, "O pagamento não pode ser estornado no status atual.")
      applyRefund(payment, input.motivo)
      recordAudit(admin, { acao: "estornar", entidade: "pagamento", entidadeId: id })
      return noContent()
    }),
  },
]
