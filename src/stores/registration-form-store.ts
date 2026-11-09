import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { REGISTRATION_STEP } from "@/enums/registration-step.enum"
import type { AthleteStepValues, DistanceStepData, TermsStepValues } from "@/lib/validations/registration.schema"
import type { CreatedRegistration } from "@/types/api/registration.interface"

interface RegistrationFormState {
  eventSlug: string | null
  step: REGISTRATION_STEP
  distance: DistanceStepData | null
  athlete: AthleteStepValues | null
  terms: TermsStepValues | null
  /** Resposta do `POST /inscricoes`, lida em `/inscricao/confirmada`. Só em memória (não persistida). */
  confirmation: CreatedRegistration | null

  /** Começa (ou retoma) o formulário do evento; trocar de evento descarta o rascunho anterior. */
  start: (eventSlug: string) => void
  goToStep: (step: REGISTRATION_STEP) => void
  setDistance: (data: DistanceStepData) => void
  setAthlete: (data: AthleteStepValues) => void
  setTerms: (data: TermsStepValues) => void
  /** Desmarca os aceites e volta para a etapa de termos (documentos vigentes mudaram). */
  clearTerms: () => void
  setConfirmation: (confirmation: CreatedRegistration) => void
  /** Limpa o rascunho mantendo a `confirmation` (a página de confirmação ainda a exibe). */
  reset: () => void
}

const initialDraft = {
  eventSlug: null,
  step: REGISTRATION_STEP.DISTANCE,
  distance: null,
  athlete: null,
  terms: null,
}

/**
 * Estado do formulário multi-etapas, persistido em **sessionStorage** para o atleta não perder os
 * dados ao recarregar a página.
 *
 * LGPD: o passo do atleta (com CPF/WhatsApp) também vai para o sessionStorage — decisão consciente:
 * fica só nesta aba e some ao fechá-la, nunca vai para localStorage, URL ou servidor antes do envio.
 * `confirmation` fica fora (`partialize`) para não sobreviver a um reload.
 *
 * `skipHydration`: o wizard chama `rehydrateRegistrationForm()` depois de montar (evita mismatch SSR/cliente).
 *
 * Storage bloqueado (navegação privada, cookies desativados): `createJSONStorage` não consegue ler o
 * `sessionStorage` e o zustand **não anexa** a API `persist` ao store — o rascunho fica só em memória.
 * Por isso, use sempre os helpers abaixo em vez de `useRegistrationFormStore.persist` direto.
 */
export const useRegistrationFormStore = create<RegistrationFormState>()(
  persist(
    (set, get) => ({
      ...initialDraft,
      confirmation: null,
      start: (eventSlug) => {
        if (get().eventSlug !== eventSlug) set({ ...initialDraft, eventSlug, confirmation: null })
      },
      goToStep: (step) => set({ step }),
      setDistance: (distance) => set({ distance, step: REGISTRATION_STEP.ATHLETE }),
      setAthlete: (athlete) => set({ athlete, step: REGISTRATION_STEP.TERMS }),
      setTerms: (terms) => set({ terms, step: REGISTRATION_STEP.SUMMARY }),
      clearTerms: () => set({ terms: null, step: REGISTRATION_STEP.TERMS }),
      setConfirmation: (confirmation) => set({ confirmation }),
      reset: () => set(initialDraft),
    }),
    {
      name: "vertex-registration-form",
      version: 2,
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: ({ eventSlug, step, distance, athlete, terms }) => ({ eventSlug, step, distance, athlete, terms }),
      // Rascunhos da versão anterior (antes da API VertexMove) têm outro formato: descarta.
      migrate: () => initialDraft,
    },
  ),
)

type PersistApi = typeof useRegistrationFormStore.persist

/** `undefined` quando o storage está indisponível (ver acima) — o tipo do zustand não reflete isso. */
function getPersistApi(): PersistApi | undefined {
  return useRegistrationFormStore.persist as PersistApi | undefined
}

/** Assina o fim da hidratação. Sem storage, não há hidratação a esperar. */
export function subscribeRegistrationFormHydration(onChange: () => void): () => void {
  return getPersistApi()?.onFinishHydration(onChange) ?? (() => {})
}

/** true depois de ler o rascunho do sessionStorage — ou sempre, se o storage estiver bloqueado. */
export function hasRegistrationFormHydrated(): boolean {
  return getPersistApi()?.hasHydrated() ?? true
}

/** Lê o rascunho do sessionStorage (no-op se o storage estiver bloqueado). */
export async function rehydrateRegistrationForm(): Promise<void> {
  await Promise.resolve(getPersistApi()?.rehydrate())
}
