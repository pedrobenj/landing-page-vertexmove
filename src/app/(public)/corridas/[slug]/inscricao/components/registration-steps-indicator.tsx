import { REGISTRATION_STEPS } from "@/lib/utils"

import { RegistrationStepIndicatorItem } from "./registration-step-indicator-item"

interface RegistrationStepsIndicatorProps {
  currentStep: number
}

/** Indicador de etapas: bolinhas numeradas ligadas por uma linha; no mobile, o nome da etapa atual embaixo. */
export function RegistrationStepsIndicator({ currentStep }: RegistrationStepsIndicatorProps) {
  const current = REGISTRATION_STEPS.find((item) => item.step === currentStep)
  const position = REGISTRATION_STEPS.findIndex((item) => item.step === currentStep) + 1

  return (
    <nav aria-label="Etapas da inscrição" className="flex flex-col gap-3">
      <div className="relative">
        <span aria-hidden="true" className="absolute top-[1.125rem] right-[12.5%] left-[12.5%] h-0.5 bg-slate-200" />
        <ol className="relative flex">
          {REGISTRATION_STEPS.map((item, index) => (
            <RegistrationStepIndicatorItem key={item.step} item={item} position={index + 1} currentStep={currentStep} />
          ))}
        </ol>
      </div>
      <p aria-hidden="true" className="text-center text-sm font-semibold text-brand-navy-deep sm:hidden">
        Etapa {position} de {REGISTRATION_STEPS.length} · {current?.label}
      </p>
    </nav>
  )
}
