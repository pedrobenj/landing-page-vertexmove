import type { REGISTRATION_STEP } from "@/enums/registration-step.enum"

/** Etapa exibida no indicador do formulário de inscrição. */
export interface RegistrationStepItem {
  step: REGISTRATION_STEP
  label: string
}
