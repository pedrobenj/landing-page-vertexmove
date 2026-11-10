import { Search } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { EmptyState } from "@/components/feedback"
import { RegistrationPaymentPanel } from "@/components/registration-payment"
import { SectionBand, SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { isRegistrationCode } from "@/lib/utils"

import { ClearReturnParams } from "./components"

/** Lê os parâmetros da URL: renderiza sob demanda, sem shell estático. */
export const instant = false

export const metadata: Metadata = {
  title: "Pagamento da inscrição",
  robots: { index: false, follow: false },
}

/**
 * Volta do Checkout Pro (`back_urls`). Dos parâmetros do Mercado Pago só usa `external_reference` (o código);
 * `status`/`collection_status` são ignorados: o status real vem do backend, confirmado pelo webhook (§7).
 */
export default async function PaymentReturnPage({ searchParams }: PageProps<"/inscricao/retorno">) {
  const reference = (await searchParams).external_reference
  const code = typeof reference === "string" ? reference.trim().toUpperCase() : ""

  if (!isRegistrationCode(code)) {
    return (
      <SectionBand aria-labelledby="inscricao-title" className="border-t-0" containerClassName="max-w-4xl gap-8">
        <SectionHeading as="h1" id="inscricao-title" eyebrow="Pagamento" title="Não identificamos a inscrição" />
        <EmptyState
          icon={Search}
          title="Volte pela consulta"
          description="Consulte sua inscrição pelo WhatsApp ou CPF informado para ver o status do pagamento."
          action={
            <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
              <Link href="/consulta">Consultar minha inscrição</Link>
            </Button>
          }
        />
      </SectionBand>
    )
  }

  return (
    <SectionBand aria-labelledby="inscricao-title" className="border-t-0" containerClassName="max-w-4xl gap-8">
      <ClearReturnParams code={code} />
      <RegistrationPaymentPanel code={code} awaitingConfirmation />
    </SectionBand>
  )
}
