import { NextResponse } from "next/server"

/**
 * Webhook do gateway de pagamento.
 * TODO (após definir o gateway — CLAUDE.md §15):
 *  1. Validar assinatura com PAYMENT_WEBHOOK_SECRET
 *  2. Idempotência por providerPaymentId
 *  3. Atualizar Payment + Registration em uma transação
 *  4. Disparar e-mail/WhatsApp de confirmação
 */
export async function POST() {
  return NextResponse.json({ error: "Webhook ainda não configurado" }, { status: 501 })
}
