"use client"

import { ArrowRight, CircleCheckBig, Clock, Search, TicketX } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

import { EmptyState } from "@/components/feedback"
import { PayNowButton } from "@/components/registration-payment"
import { SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { cn, getRegistrationStatusBadgeClass, getRegistrationStatusLabel } from "@/lib/utils"
import { useRegistrationFormStore } from "@/stores/registration-form-store"

import { ConfirmationAmountRow } from "./confirmation-amount-row"
import { CopyCodeButton } from "./copy-code-button"

/**
 * Confirmação da inscrição recém-criada. Os dados vêm do store em memória (não persistido): recarregar a
 * página perde a confirmação — por isso o destaque para guardar o código e o link para a consulta.
 */
export function RegistrationConfirmation() {
  const confirmation = useRegistrationFormStore((state) => state.confirmation)
  const reset = useRegistrationFormStore((state) => state.reset)

  // A inscrição foi enviada: o rascunho (com CPF/WhatsApp) sai do sessionStorage.
  useEffect(() => {
    reset()
  }, [reset])

  if (!confirmation) {
    return (
      <>
        <SectionHeading as="h1" id="confirmada-title" eyebrow="Inscrição" title="Confirmação de inscrição" />
        <EmptyState
          icon={TicketX}
          title="Nenhuma inscrição recente nesta aba"
          description="Se você já se inscreveu, consulte a inscrição pelo WhatsApp ou CPF informado."
          action={
            <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
              <Link href="/consulta">
                <Search aria-hidden="true" />
                Consultar minha inscrição
              </Link>
            </Button>
          }
        />
      </>
    )
  }

  const { codigo, status, valorBaseCentavos, valorDescontoCentavos, valorTotalCentavos } = confirmation

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        as="h1"
        id="confirmada-title"
        eyebrow="Inscrição enviada"
        title="Inscrição realizada!"
        description="Falta só o pagamento. Nos vemos na largada!"
      />
      <section aria-labelledby="confirmation-code-title" className="flex flex-col gap-5 rounded-2xl bg-brand-navy-deep p-6 text-white sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-green text-brand-navy-deep">
            <CircleCheckBig aria-hidden="true" className="size-6" />
          </span>
          <div>
            <h2 id="confirmation-code-title" className="text-xs font-bold tracking-widest text-brand-green uppercase">
              Código da inscrição
            </h2>
            <p className="text-sm text-white/75">Guarde este código: ele identifica sua inscrição.</p>
          </div>
        </div>
        <p data-testid="registration-code" className="font-heading text-3xl font-black tracking-wide break-all sm:text-5xl">
          {codigo}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className={cn("w-fit rounded-full px-3 py-1 text-sm font-bold", getRegistrationStatusBadgeClass(status))}>
            Status: {getRegistrationStatusLabel(status)}
          </span>
          <CopyCodeButton code={codigo} />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="confirmation-amount-title" className="rounded-2xl border bg-card p-6">
          <h2 id="confirmation-amount-title" className="font-heading text-lg font-black text-brand-navy-deep">
            Valores
          </h2>
          <dl className="mt-2 divide-y">
            <ConfirmationAmountRow label="Valor base" cents={valorBaseCentavos} />
            {valorDescontoCentavos > 0 && <ConfirmationAmountRow label="Desconto" cents={valorDescontoCentavos} negative />}
            <ConfirmationAmountRow label="Total" cents={valorTotalCentavos} emphasis />
          </dl>
        </section>

        <section aria-labelledby="confirmation-payment-title" className="flex flex-col gap-3 rounded-2xl border bg-slate-50 p-6">
          <h2 id="confirmation-payment-title" className="flex items-center gap-2 font-heading text-lg font-black text-brand-navy-deep">
            <Clock aria-hidden="true" className="size-5 text-brand-green-text" />
            Pagamento
          </h2>
          <p className="text-muted-foreground">
            Sua vaga está reservada. Pague com Pix ou cartão pelo Mercado Pago para garantir a inscrição.
          </p>
          <PayNowButton code={codigo} label="Ir para o pagamento" />
        </section>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
          <Link href="/consulta">
            Consultar minha inscrição
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="xl" className="w-full sm:w-auto">
          <Link href="/#corridas">Ver outras corridas</Link>
        </Button>
      </div>
    </div>
  )
}
