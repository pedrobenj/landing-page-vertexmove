"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { PAYMENT_ISSUE } from "@/enums/payment-issue.enum"
import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { apiIdSchema } from "@/lib/validations/id.schema"
import { listAdminPayments, reconcilePayment, refundPayment } from "@/server/api/endpoints/admin-payments"
import { ensureCanManageEvents } from "@/server/api/ensure-can-manage-events"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { ApiAdminPayment } from "@/types/api/admin-payment.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const LIST_ERROR_TITLE = "Não foi possível carregar os pagamentos"
const RECONCILE_ERROR_TITLE = "Não foi possível conciliar o pagamento"
const REFUND_ERROR_TITLE = "Não foi possível estornar o pagamento"

const listSchema = z.object({
  situacao: z.union([z.enum(PAYMENT_ISSUE), z.literal("todas")]),
  cursor: z.string().min(1).max(200).nullable(),
})
const refundSchema = z.object({
  id: apiIdSchema,
  motivo: z.string().trim().min(1, "Informe o motivo do estorno.").max(500, "Use no máximo 500 caracteres."),
})

/** O status do pagamento muda a inscrição (e o pedido): revalida a fila e as telas de inscritos. */
function revalidatePayments() {
  revalidatePath("/admin/pagamentos")
  revalidatePath("/admin/eventos", "layout")
}

/** Página da fila de pagamentos com pendência (situação e cursor vêm do Zustand). */
export async function listAdminPaymentsAction(input: z.input<typeof listSchema>): Promise<HttpResponse<CursorPage<ApiAdminPayment>>> {
  const parsed = listSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(LIST_ERROR_TITLE)
  const { situacao, cursor } = parsed.data
  try {
    const data = await listAdminPayments({ situacao: situacao === "todas" ? undefined : situacao, cursor: cursor ?? undefined })
    return { status: 200, data }
  } catch (error) {
    return toErrorResponse(error, { title: LIST_ERROR_TITLE, context: "listAdminPaymentsAction" })
  }
}

/** Consulta o Mercado Pago e aplica o status real (`POST /admin/pagamentos/:id/conciliar`). */
export async function reconcilePaymentAction(id: number): Promise<HttpResponse> {
  const denied = await ensureCanManageEvents(RECONCILE_ERROR_TITLE, "reconcilePaymentAction")
  if (denied) return denied
  const parsed = apiIdSchema.safeParse(id)
  if (!parsed.success) return invalidInputResponse(RECONCILE_ERROR_TITLE)
  try {
    await reconcilePayment(parsed.data)
    revalidatePayments()
    return { status: 204 }
  } catch (error) {
    return toErrorResponse(error, { title: RECONCILE_ERROR_TITLE, context: "reconcilePaymentAction" })
  }
}

/** Estorna o pagamento (confirmação dupla na UI). O backend exige o motivo (1–500 caracteres). */
export async function refundPaymentAction(id: number, motivo: string): Promise<HttpResponse> {
  const denied = await ensureCanManageEvents(REFUND_ERROR_TITLE, "refundPaymentAction")
  if (denied) return denied
  const parsed = refundSchema.safeParse({ id, motivo })
  if (!parsed.success) return invalidInputResponse(REFUND_ERROR_TITLE, parsed.error.issues[0])
  try {
    await refundPayment(parsed.data.id, parsed.data.motivo)
    revalidatePayments()
    return { status: 204 }
  } catch (error) {
    return toErrorResponse(error, { title: REFUND_ERROR_TITLE, context: "refundPaymentAction" })
  }
}
