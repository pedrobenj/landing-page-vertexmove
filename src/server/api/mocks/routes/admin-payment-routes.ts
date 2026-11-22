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
import type { MockPayment } from "../mock-types"
import { changeRegistrationStatus } from "./admin-registration-routes"

// Contrato do backend: `admin-pagamentos.controller.ts` e `pendencia-pagamento.presenter.ts`.

const listQuerySchema = z.strictObject({
  situacao: z.enum(PAYMENT_ISSUE),
  cursor: z.string().min(1).max(256).optional(),
  limit: z.string().optional(),
})
const refundSchema = z.strictObject({ motivo: z.string().trim().min(1, "é obrigatório").max(500) })
const RECONCILABLE: ReadonlySet<PAYMENT_STATUS> = new Set([PAYMENT_STATUS.CREATED, PAYMENT_STATUS.PENDING, PAYMENT_STATUS.UNDER_REVIEW])
const FLAGGABLE: ReadonlySet<PAYMENT_STATUS> = new Set([PAYMENT_STATUS.UNDER_REVIEW, PAYMENT_STATUS.APPROVED])

/** Mesmos filtros do repositório do backend (`kysely-pagamento.repository.ts`). */
const MATCHES: Record<PAYMENT_ISSUE, (payment: MockPayment) => boolean> = {
  [PAYMENT_ISSUE.UNDER_REVIEW]: (payment) => payment.status === PAYMENT_STATUS.UNDER_REVIEW && payment.estornoSolicitadoEm === null,
  [PAYMENT_ISSUE.REFUND_PENDING]: (payment) => payment.estornoSolicitadoEm !== null && FLAGGABLE.has(payment.status),
  [PAYMENT_ISSUE.MISMATCH]: (payment) => payment.estornoMotivo === "pagamento_divergente" && FLAGGABLE.has(payment.status),
}

function isRefundable(payment: MockPayment): boolean {
  return payment.status === PAYMENT_STATUS.APPROVED || (payment.status === PAYMENT_STATUS.UNDER_REVIEW && payment.estornoSolicitadoEm !== null)
}

function utc(value: string | null): string | null {
  return value ? new Date(value).toISOString() : null
}

function toAdminPayment(payment: MockPayment): ApiAdminPayment {
  const registration = getMockDb().registrations.find((item) => item.id === payment.inscricaoId)
  return {
    id: payment.id,
    status: payment.status,
    valorCentavos: payment.valorCentavos,
    valorGatewayCentavos: payment.valorGatewayCentavos,
    gatewayPaymentId: payment.gatewayPaymentId,
    gatewayStatus: payment.gatewayStatus,
    metodo: payment.metodo,
    pagoEm: utc(payment.pagoEm),
    estornoSolicitadoEm: utc(payment.estornoSolicitadoEm),
    estornoMotivo: payment.estornoMotivo,
    criadoEm: new Date(payment.criadoEm).toISOString(),
    atualizadoEm: new Date(payment.atualizadoEm).toISOString(),
    origem: payment.pedidoLojaCodigo
      ? { tipo: "pedido_loja", pedidoLojaId: payment.id, codigo: payment.pedidoLojaCodigo }
      : { tipo: "inscricao", inscricaoId: payment.inscricaoId ?? 0, codigo: registration?.codigo ?? "" },
    acoes: { conciliar: RECONCILABLE.has(payment.status), estornar: isRefundable(payment) },
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
  const registration = findRegistration(payment)
  if (payment.status === PAYMENT_STATUS.APPROVED && registration?.status === REGISTRATION_STATUS.CONFIRMED) {
    changeRegistrationStatus(registration, REGISTRATION_STATUS.REFUNDED, { origem: "admin", motivo })
    registration.pagamentoStatus = PAYMENT_STATUS.REFUNDED
  }
  payment.status = PAYMENT_STATUS.REFUNDED
  payment.gatewayStatus = "refunded"
  payment.estornoMotivo = motivo
  payment.atualizadoEm = new Date().toISOString()
}

export const adminPaymentRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/admin/pagamentos",
    handler: withAdmin((ctx) => {
      const query = listQuerySchema.safeParse(Object.fromEntries(ctx.query.entries()))
      if (!query.success) return apiError(422, API_ERROR_CODE.INVALID_DATA, "situacao: é obrigatória (em_analise, estorno_pendente ou divergente).")
      const items = getMockDb()
        .payments.filter(MATCHES[query.data.situacao])
        .sort((a, b) => b.id - a.id)
      const page = paginate(items, ctx.query, (payment) => payment.id, toAdminPayment)
      return page instanceof Response ? page : json(200, page)
    }),
  },
  {
    // Simula a consulta ao Mercado Pago: só muda status conciliável (criado, pendente, em análise).
    // Em análise sem estorno pedido → aprovado (confirma a inscrição pendente); com estorno pedido → estornado.
    method: "POST",
    path: "/admin/pagamentos/:id/conciliar",
    handler: withAdmin((ctx, admin) => {
      const paymentId = paramId(ctx)
      if (paymentId === null) return invalidId("pagamentoId")
      const payment = getMockDb().payments.find((item) => item.id === paymentId)
      if (!payment) return paymentNotFound()
      const now = new Date().toISOString()
      if (payment.status === PAYMENT_STATUS.UNDER_REVIEW && payment.estornoSolicitadoEm !== null) {
        applyRefund(payment, payment.estornoMotivo ?? "estorno_gateway")
      } else if (RECONCILABLE.has(payment.status)) {
        payment.status = PAYMENT_STATUS.APPROVED
        payment.gatewayStatus = "approved"
        payment.pagoEm = now
        payment.valorGatewayCentavos = payment.valorCentavos
        payment.atualizadoEm = now
        const registration = findRegistration(payment)
        if (registration?.status === REGISTRATION_STATUS.PENDING) {
          changeRegistrationStatus(registration, REGISTRATION_STATUS.CONFIRMED, { origem: "gateway", motivo: "pagamento_aprovado" })
          registration.pagamentoStatus = PAYMENT_STATUS.APPROVED
        }
      }
      recordAudit(admin, { acao: "atualizar", entidade: "pagamento", entidadeId: paymentId })
      return noContent()
    }),
  },
  {
    method: "POST",
    path: "/admin/pagamentos/:id/estornar",
    handler: withAdmin((ctx, admin) => {
      const paymentId = paramId(ctx)
      if (paymentId === null) return invalidId("pagamentoId")
      const input = validate(refundSchema, ctx.body)
      if (input instanceof Response) return input
      const payment = getMockDb().payments.find((item) => item.id === paymentId)
      if (!payment) return paymentNotFound()
      if (!isRefundable(payment)) return apiError(409, API_ERROR_CODE.STATE_CONFLICT, "O pagamento não pode ser estornado no status atual.")
      applyRefund(payment, input.motivo)
      recordAudit(admin, { acao: "estornar", entidade: "pagamento", entidadeId: paymentId })
      return noContent()
    }),
  },
]
