import { REGISTRATION_STEP } from "@/enums/registration-step.enum"
import type { RegistrationStepItem } from "@/types/registration-step-item.interface"

export const REGISTRATION_STEPS: readonly RegistrationStepItem[] = [
  { step: REGISTRATION_STEP.DISTANCE, label: "Distância e kit" },
  { step: REGISTRATION_STEP.ATHLETE, label: "Seus dados" },
  { step: REGISTRATION_STEP.TERMS, label: "Termos" },
  { step: REGISTRATION_STEP.SUMMARY, label: "Revisão" },
]
