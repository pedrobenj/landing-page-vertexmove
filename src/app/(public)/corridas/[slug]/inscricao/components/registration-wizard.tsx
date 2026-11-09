"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useShallow } from "zustand/react/shallow"

import { REGISTRATION_STEP } from "@/enums/registration-step.enum"
import { useRegistrationFormHydrated } from "@/hooks/use-registration-form-hydrated"
import { createAthleteStepSchema, createDistanceStepSchema } from "@/lib/validations/registration.schema"
import { rehydrateRegistrationForm, useRegistrationFormStore } from "@/stores/registration-form-store"
import type { PublicDocument, PublicEventDetail } from "@/types/api/public-event-detail.interface"

import { AthleteStep } from "./athlete-step"
import { DistanceStep } from "./distance-step"
import { RegistrationStepsIndicator } from "./registration-steps-indicator"
import { RegistrationWizardSkeleton } from "./registration-wizard-skeleton"
import { SummaryStep } from "./summary-step"
import { TermsStep } from "./terms-step"

interface RegistrationWizardProps {
  event: PublicEventDetail
  regulation: PublicDocument
  liabilityTerm: PublicDocument
}

/**
 * Formulário de inscrição em etapas. O rascunho vive no `useRegistrationFormStore` (sessionStorage):
 * recarregar a página retoma a etapa e os dados. Os passos salvos são revalidados antes do resumo —
 * o sessionStorage pode ter sido editado ou o evento mudado.
 */
export function RegistrationWizard({ event, regulation, liabilityTerm }: RegistrationWizardProps) {
  const hydrated = useRegistrationFormHydrated()
  const containerRef = useRef<HTMLDivElement>(null)
  const previousStepRef = useRef<REGISTRATION_STEP | null>(null)
  const [identityConflict, setIdentityConflict] = useState(false)

  const draft = useRegistrationFormStore(
    useShallow((state) => ({
      eventSlug: state.eventSlug,
      step: state.step,
      distance: state.distance,
      athlete: state.athlete,
      terms: state.terms,
    })),
  )
  const { start, goToStep, setDistance, setAthlete, setTerms, clearTerms, setConfirmation } = useRegistrationFormStore(
    useShallow((state) => ({
      start: state.start,
      goToStep: state.goToStep,
      setDistance: state.setDistance,
      setAthlete: state.setAthlete,
      setTerms: state.setTerms,
      clearTerms: state.clearTerms,
      setConfirmation: state.setConfirmation,
    })),
  )

  useEffect(() => {
    void rehydrateRegistrationForm().then(() => start(event.slug))
  }, [event.slug, start])

  const isReady = hydrated && draft.eventSlug === event.slug
  const savedDistance = useMemo(
    () => (draft.distance ? createDistanceStepSchema(event).safeParse(draft.distance) : null),
    [event, draft.distance],
  )
  const savedAthlete = useMemo(
    () => (draft.athlete ? createAthleteStepSchema(event.dataEvento).safeParse(draft.athlete) : null),
    [event.dataEvento, draft.athlete],
  )

  // Etapa efetiva: não deixa pular para uma etapa cujo passo anterior está faltando ou ficou inválido.
  const step = useMemo(() => {
    if (draft.step > REGISTRATION_STEP.DISTANCE && !savedDistance?.success) return REGISTRATION_STEP.DISTANCE
    if (draft.step > REGISTRATION_STEP.ATHLETE && !savedAthlete?.success) return REGISTRATION_STEP.ATHLETE
    if (draft.step > REGISTRATION_STEP.TERMS && !draft.terms) return REGISTRATION_STEP.TERMS
    return draft.step
  }, [draft.step, draft.terms, savedDistance, savedAthlete])

  // Troca de etapa: rola até o topo do formulário e leva o foco ao título (leitores de tela anunciam a etapa).
  // Com conflito de identidade, a etapa do atleta foca o CPF em vez do título.
  useEffect(() => {
    if (!isReady) return
    if (previousStepRef.current !== null && previousStepRef.current !== step) {
      containerRef.current?.scrollIntoView({ block: "start" })
      if (!identityConflict) {
        containerRef.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true })
      }
    }
    previousStepRef.current = step
  }, [isReady, step, identityConflict])

  if (!isReady) return <RegistrationWizardSkeleton />

  const documentIds = [regulation.id, liabilityTerm.id]

  return (
    <div ref={containerRef} className="flex scroll-mt-24 flex-col gap-8">
      <RegistrationStepsIndicator currentStep={step} />
      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
        {step === REGISTRATION_STEP.DISTANCE && (
          <DistanceStep event={event} defaultValues={savedDistance?.success ? savedDistance.data : null} onSubmit={setDistance} />
        )}
        {step === REGISTRATION_STEP.ATHLETE && (
          <AthleteStep
            eventDate={event.dataEvento}
            defaultValues={draft.athlete}
            identityConflict={identityConflict}
            onBack={() => goToStep(REGISTRATION_STEP.DISTANCE)}
            onSubmit={(data) => {
              setIdentityConflict(false)
              setAthlete(data)
            }}
          />
        )}
        {step === REGISTRATION_STEP.TERMS && (
          <TermsStep
            regulation={regulation}
            liabilityTerm={liabilityTerm}
            defaultValues={draft.terms}
            onBack={() => goToStep(REGISTRATION_STEP.ATHLETE)}
            onSubmit={setTerms}
          />
        )}
        {step === REGISTRATION_STEP.SUMMARY && savedDistance?.success && savedAthlete?.success && (
          <SummaryStep
            event={event}
            distance={savedDistance.data}
            athlete={savedAthlete.data}
            documentIds={documentIds}
            onEdit={goToStep}
            onDocumentsOutdated={clearTerms}
            onIdentityConflict={() => {
              setIdentityConflict(true)
              goToStep(REGISTRATION_STEP.ATHLETE)
            }}
            onSuccess={setConfirmation}
          />
        )}
      </div>
    </div>
  )
}
