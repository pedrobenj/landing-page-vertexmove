"use client"

import { ArrowLeft, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useRef, useState, useTransition } from "react"
import { toast } from "sonner"

import { createRegistrationAction } from "@/app/actions/registrations"
import { Button } from "@/components/ui/button"
import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { REGISTRATION_STEP } from "@/enums/registration-step.enum"
import { formatCurrency, maskCpf, maskEmail, maskPhone, toCreateRegistrationInput } from "@/lib/utils"
import type { AthleteStepData, DistanceStepData } from "@/lib/validations/registration.schema"
import type { PublicEventDetail } from "@/types/api/public-event-detail.interface"
import type { CreatedRegistration } from "@/types/api/registration.interface"

import { StepHeading } from "./step-heading"
import { SummaryRow } from "./summary-row"
import { SummarySection } from "./summary-section"

interface SummaryStepProps {
  event: PublicEventDetail
  distance: DistanceStepData
  athlete: AthleteStepData
  documentIds: number[]
  onEdit: (step: REGISTRATION_STEP) => void
  onIdentityConflict: () => void
  onSuccess: (confirmation: CreatedRegistration) => void
}

const CONFIRMATION_PATH = "/inscricao/confirmada"

/**
 * Etapa 4: revisão com dados mascarados e envio para `POST /inscricoes`. O preço exibido é o do lote
 * vigente; o valor final (com descontos) vem da API na confirmação.
 */
export function SummaryStep({ event, distance, athlete, documentIds, onEdit, onIdentityConflict, onSuccess }: SummaryStepProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRedirecting, setIsRedirecting] = useState(false)
  // Trava síncrona contra duplo envio (o estado do React só muda no próximo render).
  const submittingRef = useRef(false)

  const selection = useMemo(
    () => ({
      distance: event.distancias?.find((item) => item.id === distance.distanciaId),
      kit: event.kits?.find((item) => item.id === distance.kitId),
      size: event.tamanhosCamisa?.find((item) => item.id === distance.tamanhoCamisaId),
    }),
    [event, distance],
  )

  function handleConfirm() {
    if (submittingRef.current) return
    submittingRef.current = true

    startTransition(async () => {
      let response: Awaited<ReturnType<typeof createRegistrationAction>>
      try {
        response = await createRegistrationAction(toCreateRegistrationInput(event.slug, { distance, athlete }, documentIds))
      } catch {
        submittingRef.current = false
        toast.error("Não foi possível enviar a inscrição", { description: "Verifique sua conexão e tente de novo." })
        return
      }

      if (response.status === 201 && response.data) {
        setIsRedirecting(true)
        onSuccess(response.data)
        router.push(CONFIRMATION_PATH)
        return
      }

      submittingRef.current = false
      const title = response.title ?? "Não foi possível concluir a inscrição"
      switch (response.code) {
        case API_ERROR_CODE.DUPLICATE_REGISTRATION:
          toast.error(title, {
            description: response.error,
            duration: 10_000,
            action: { label: "Consultar inscrição", onClick: () => router.push("/consulta") },
          })
          return
        case API_ERROR_CODE.CONFLICTING_IDENTITIES:
          toast.error(title, { description: response.error })
          onIdentityConflict()
          return
        case API_ERROR_CODE.DOCUMENT_ACCEPTANCE_REQUIRED:
          toast.error(title, { description: response.error })
          onEdit(REGISTRATION_STEP.TERMS)
          return
        case API_ERROR_CODE.SOLD_OUT:
          toast.error(title, { description: response.error })
          router.refresh()
          onEdit(REGISTRATION_STEP.DISTANCE)
          return
        default:
          toast.error(title, { description: response.error })
      }
    })
  }

  const isBusy = isPending || isRedirecting

  return (
    <div className="flex flex-col gap-8">
      <StepHeading title="Revise sua inscrição" description="Confira tudo antes de confirmar." />

      <div className="flex flex-col gap-4">
        <SummarySection title="Prova" onEdit={() => onEdit(REGISTRATION_STEP.DISTANCE)} editLabel="Editar distância e kit">
          <SummaryRow label="Corrida">{event.nome}</SummaryRow>
          <SummaryRow label="Distância">{selection.distance?.nome}</SummaryRow>
          <SummaryRow label="Kit">{selection.kit?.nome ?? "Sem kit"}</SummaryRow>
          {selection.size && <SummaryRow label="Tamanho da camisa">{selection.size.codigo}</SummaryRow>}
        </SummarySection>

        <SummarySection title="Atleta" onEdit={() => onEdit(REGISTRATION_STEP.ATHLETE)} editLabel="Editar dados do atleta">
          <SummaryRow label="Nome">{athlete.nomeCompleto}</SummaryRow>
          <SummaryRow label="Nascimento">{athlete.dataNascimento}</SummaryRow>
          {athlete.cpf && <SummaryRow label="CPF">{maskCpf(athlete.cpf)}</SummaryRow>}
          {athlete.whatsapp && <SummaryRow label="WhatsApp">{maskPhone(athlete.whatsapp)}</SummaryRow>}
          {athlete.email && <SummaryRow label="E-mail">{maskEmail(athlete.email)}</SummaryRow>}
        </SummarySection>

        <section aria-labelledby="summary-price-title" className="rounded-2xl bg-brand-navy-deep p-5 text-white">
          <h3 id="summary-price-title" className="sr-only">
            Valor
          </h3>
          <div className="flex items-end justify-between gap-4">
            <p className="flex flex-col">
              <span className="text-xs font-bold tracking-widest text-brand-green uppercase">
                {selection.distance?.loteVigente?.nome ?? "Lote vigente"}
              </span>
              <span className="text-sm text-white/75">Valor da inscrição</span>
            </p>
            <p className="font-heading text-3xl font-black">
              {selection.distance?.loteVigente ? formatCurrency(selection.distance.loteVigente.precoCentavos) : "—"}
            </p>
          </div>
          <p className="mt-4 flex gap-2 border-t border-white/15 pt-4 text-sm text-white/80">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-green" />
            O valor final é confirmado após o envio. Descontos (como o de 60+) são aplicados automaticamente.
          </p>
        </section>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full sm:w-auto"
          onClick={() => onEdit(REGISTRATION_STEP.TERMS)}
          disabled={isBusy}
        >
          <ArrowLeft aria-hidden="true" />
          Voltar
        </Button>
        <Button
          type="button"
          variant="cta"
          size="xl"
          className="w-full normal-case tracking-normal sm:w-auto"
          onClick={handleConfirm}
          disabled={isBusy}
        >
          {isBusy ? "Enviando..." : "Confirmar inscrição"}
        </Button>
      </div>
    </div>
  )
}
