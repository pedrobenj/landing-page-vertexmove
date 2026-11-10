"use client"

import { CircleCheckBig, Clock, Loader2, type LucideIcon, TicketX, XCircle } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { EmptyState, ServerError } from "@/components/feedback"
import { SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { RegistrationDetailsError, useRegistrationPayment } from "@/hooks/data/use-registration-payment"
import { getPaymentView, getRegistrationStatusLabel, type PaymentView } from "@/lib/utils"
import type { RegistrationDetails } from "@/types/api/registration-details.interface"

import { EventLink } from "./event-link"
import { LookupLink } from "./lookup-link"
import { PayNowButton } from "./pay-now-button"
import { PaymentStateCard } from "./payment-state-card"
import { RegistrationPaymentSkeleton } from "./registration-payment-skeleton"
import { RegistrationSummary } from "./registration-summary"

interface RegistrationPaymentPanelProps {
  code: string
  /** Voltou do Checkout Pro: mostra "Confirmando seu pagamento…" e consulta até o webhook confirmar. */
  awaitingConfirmation?: boolean
}

const LINK_BUTTON_CLASS = "w-full normal-case tracking-normal sm:w-auto"

interface ViewContent {
  icon: LucideIcon
  iconClassName?: string
  title: string
  description: string
  tone: "success" | "waiting" | "warning"
  actions: ReactNode
}

function getViewContent(view: PaymentView, details: RegistrationDetails): ViewContent {
  const { codigo, evento } = details
  switch (view) {
    case "confirmed":
      return {
        icon: CircleCheckBig,
        title: "Pagamento confirmado!",
        description: "Sua inscrição está garantida. As orientações de retirada do kit chegam pelo WhatsApp ou e-mail informado. Nos vemos na largada!",
        tone: "success",
        actions: (
          <Button asChild variant="cta" size="xl" className={LINK_BUTTON_CLASS}>
            <Link href={evento.slug ? `/corridas/${evento.slug}` : "/#corridas"}>Ver a corrida</Link>
          </Button>
        ),
      }
    case "confirming":
      return {
        icon: Loader2,
        iconClassName: "animate-spin",
        title: "Confirmando seu pagamento…",
        description: "Estamos aguardando a confirmação do Mercado Pago. Isso costuma levar poucos segundos.",
        tone: "waiting",
        actions: null,
      }
    case "not-confirmed-yet":
      return {
        icon: Clock,
        title: "Ainda não recebemos a confirmação",
        description: "Se você já pagou, a confirmação pode levar alguns minutos. Consulte em instantes em Consultar inscrição.",
        tone: "waiting",
        actions: <LookupLink />,
      }
    case "awaiting-payment":
      return {
        icon: Clock,
        title: "Aguardando pagamento",
        description: "Sua vaga está reservada. Pague com Pix ou cartão pelo Mercado Pago para garantir a inscrição.",
        tone: "waiting",
        actions: <PayNowButton code={codigo} />,
      }
    case "payment-failed":
      return {
        icon: XCircle,
        title: "Pagamento não aprovado",
        description: "O Mercado Pago não aprovou o pagamento. Você pode tentar de novo com Pix ou outro cartão.",
        tone: "warning",
        actions: <PayNowButton code={codigo} label="Tentar novamente" />,
      }
    case "closed":
      return {
        icon: TicketX,
        title: `Inscrição ${getRegistrationStatusLabel(details.status).toLowerCase()}`,
        description: "Esta inscrição não aceita mais pagamento. Se ainda houver vagas, faça uma nova inscrição.",
        tone: "warning",
        actions: <EventLink slug={evento.slug} label="Ver a corrida" />,
      }
  }
}

/** Status e pagamento (Checkout Pro) da inscrição: retorno do Mercado Pago e `/inscricao/[code]`. */
export function RegistrationPaymentPanel({ code, awaitingConfirmation = false }: RegistrationPaymentPanelProps) {
  const { data, error, isPending, refetch, isRefetching, pollingExpired } = useRegistrationPayment(code, awaitingConfirmation)

  const heading = (
    <SectionHeading as="h1" id="inscricao-title" eyebrow={`Inscrição ${code}`} title="Sua inscrição" />
  )

  if (isPending) {
    return (
      <>
        {heading}
        <RegistrationPaymentSkeleton />
      </>
    )
  }

  if (error || !data) {
    const notFound = error instanceof RegistrationDetailsError && error.status === 404
    return (
      <>
        {heading}
        {notFound ? (
          <EmptyState
            icon={TicketX}
            title="Inscrição não encontrada"
            description="Confira o código ou consulte suas inscrições pelo WhatsApp ou CPF informado."
            action={<LookupLink />}
          />
        ) : (
          <ServerError
            title="Não foi possível consultar a inscrição"
            action={
              <Button type="button" variant="outline" onClick={() => refetch()} disabled={isRefetching}>
                Tentar de novo
              </Button>
            }
          />
        )}
      </>
    )
  }

  const view = getPaymentView({ details: data, awaitingConfirmation, pollingExpired })
  const content = getViewContent(view, data)

  return (
    <>
      {heading}
      <div className="flex flex-col gap-6">
        <PaymentStateCard
          icon={content.icon}
          iconClassName={content.iconClassName}
          title={content.title}
          description={content.description}
          tone={content.tone}
          live
        >
          {content.actions}
        </PaymentStateCard>
        <RegistrationSummary details={data} />
      </div>
    </>
  )
}
