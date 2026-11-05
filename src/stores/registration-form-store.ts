import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { REGISTRATION_STEP } from "@/enums/registration-step.enum"
import type { ParticipantInput } from "@/lib/validations/participant.schema"
import type { ModalityAndKitInput } from "@/lib/validations/registration.schema"

interface RegistrationFormState {
  eventSlug: string | null
  step: REGISTRATION_STEP
  modalityAndKit: ModalityAndKitInput | null
  participant: ParticipantInput | null
  termsAcceptedAt: string | null
  couponCode: string

  start: (eventSlug: string) => void
  goToStep: (step: REGISTRATION_STEP) => void
  setModalityAndKit: (data: ModalityAndKitInput) => void
  setParticipant: (data: ParticipantInput) => void
  acceptTerms: () => void
  setCouponCode: (code: string) => void
  reset: () => void
}

const initialState = {
  eventSlug: null,
  step: REGISTRATION_STEP.MODALITY_AND_KIT,
  modalityAndKit: null,
  participant: null,
  termsAcceptedAt: null,
  couponCode: "",
}

/**
 * Estado do formulário multi-etapas. Persistido em sessionStorage para o atleta
 * não perder os dados ao recarregar a página (some ao fechar a aba).
 */
export const useRegistrationFormStore = create<RegistrationFormState>()(
  persist(
    (set, get) => ({
      ...initialState,
      start: (eventSlug) => {
        if (get().eventSlug !== eventSlug) set({ ...initialState, eventSlug })
      },
      goToStep: (step) => set({ step }),
      setModalityAndKit: (modalityAndKit) =>
        set({ modalityAndKit, step: REGISTRATION_STEP.PARTICIPANT }),
      setParticipant: (participant) => set({ participant, step: REGISTRATION_STEP.TERMS }),
      acceptTerms: () =>
        set({ termsAcceptedAt: new Date().toISOString(), step: REGISTRATION_STEP.PAYMENT }),
      setCouponCode: (couponCode) => set({ couponCode }),
      reset: () => set(initialState),
    }),
    {
      name: "vertex-registration-form",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
