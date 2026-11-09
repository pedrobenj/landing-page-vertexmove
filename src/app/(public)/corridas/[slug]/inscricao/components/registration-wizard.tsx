"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { REGISTRATION_STEP } from "@/enums/registration-step.enum"
import { useRegistrationFormHydrated } from "@/hooks/use-registration-form-hydrated"
import { athleteStepSchema, createDistanceStepSchema } from "@/lib/validations/registration.schema"
import { useRegistrationFormStore } from "@/stores/registration-form-store"
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

  const store = useRegistrationFormStore()
  const { start, goToStep, setDistance, setAthlete, setTerms, setConfirmation } = store

  useEffect(() => {
    void Promise.resolve(useRegistrationFormStore.persist.rehydrate()).then(() => start(event.slug))
  }, [event.slug, start])

  const isReady = hydrated && store.eventSlug === event.slug
  const savedDistance = useMemo(
    () => (store.distance ? createDistanceStepSchema(event).safeParse(store.distance) : null),
    [event, store.distance],
  )
  const savedAthlete = useMemo(() => (store.athlete ? athleteStepSchema.safeParse(store.athlete) : null), [store.athlete])

  // Etapa efetiva: não deixa pular para uma etapa cujo passo anterior está faltando ou ficou inválido.
  const step = useMemo(() => {
    if (store.step > REGISTRATION_STEP.DISTANCE && !savedDistance?.success) return REGISTRATION_STEP.DISTANCE
    if (store.step > REGISTRATION_STEP.ATHLETE && !savedAthlete?.success) return REGISTRATION_STEP.ATHLETE
    if (store.step > REGISTRATION_STEP.TERMS && !store.terms) return REGISTRATION_STEP.TERMS
    return store.step
  }, [store.step, store.terms, savedDistance, savedAthlete])

  // Troca de etapa: rola até o topo do formulário e leva o foco ao título (leitores de tela anunciam a etapa).
  useEffect(() => {
    if (!isReady) return
    if (previousStepRef.current !== null && previousStepRef.current !== step) {
      containerRef.current?.scrollIntoView({ block: "start" })
      containerRef.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true })
    }
    previousStepRef.current = step
  }, [isReady, step])

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
            defaultValues={store.athlete}
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
            defaultValues={store.terms}
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
