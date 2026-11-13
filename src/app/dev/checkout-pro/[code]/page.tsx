import type { Metadata } from "next"
import { notFound, unstable_rethrow } from "next/navigation"

import { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { env } from "@/lib/env"
import { formatCurrency, isRegistrationCode } from "@/lib/utils"
import { isApiError } from "@/server/api/api-error"
import { getRegistrationDetails } from "@/server/api/endpoints/registration-payment"
import { getRegistrationAccessToken } from "@/server/api/registration-access"

import { MockPaymentOption } from "./components"

/** Só existe no modo mock: o `notFound()` precisa rodar antes do streaming. */
export const instant = false

export const metadata: Metadata = {
  title: "Checkout simulado",
  robots: { index: false, follow: false },
}

const OPTIONS = [
  { resultado: PAYMENT_STATUS.APPROVED, label: "Aprovar pagamento", hint: "Pix pago ou cartão aprovado (o webhook confirma em ~4 s)" },
  { resultado: PAYMENT_STATUS.PENDING, label: "Deixar pendente", hint: "Pix gerado e ainda não pago" },
  { resultado: PAYMENT_STATUS.REJECTED, label: "Recusar", hint: "Cartão recusado" },
]

/**
 * Checkout falso do modo mock (`USE_MOCK_API`), no lugar da página do Mercado Pago: escolhe o resultado,
 * simula o webhook e volta para `/inscricao/retorno` como o Checkout Pro faria.
 */
export default async function MockCheckoutPage({ params }: PageProps<"/dev/checkout-pro/[code]">) {
  if (!env.USE_MOCK_API) notFound()
  const { code } = await params
  if (!isRegistrationCode(code)) notFound()
  const token = await getRegistrationAccessToken(code)
  if (!token) notFound()

  let total: number
  try {
    total = (await getRegistrationDetails(code, token)).valorTotalCentavos
  } catch (error) {
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) notFound()
    throw error
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-slate-100 px-4 py-12">
      <section aria-labelledby="mock-checkout-title" className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-card p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Modo mock · não é o Mercado Pago</p>
          <h1 id="mock-checkout-title" className="font-heading text-2xl font-black text-brand-navy-deep">
            Checkout simulado
          </h1>
          <p className="text-sm text-muted-foreground">
            Inscrição <strong>{code}</strong> · {formatCurrency(total)}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {OPTIONS.map((option) => (
            <MockPaymentOption key={option.resultado} code={code} {...option} />
          ))}
        </div>
      </section>
    </main>
  )
}
