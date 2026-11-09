import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import type { RegistrationStepItem } from "@/types/registration-step-item.interface"

interface RegistrationStepIndicatorItemProps {
  item: RegistrationStepItem
  position: number
  currentStep: number
}

/** Bolinha numerada da etapa: concluída (verde com check), atual (navy) ou próxima (contorno). */
export function RegistrationStepIndicatorItem({ item, position, currentStep }: RegistrationStepIndicatorItemProps) {
  const isDone = item.step < currentStep
  const isCurrent = item.step === currentStep

  return (
    <li aria-current={isCurrent ? "step" : undefined} className="flex flex-1 flex-col items-center gap-2 text-center">
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full border-2 font-heading text-sm font-black",
          isDone && "border-brand-green bg-brand-green text-brand-navy-deep",
          isCurrent && "border-brand-navy-deep bg-brand-navy-deep text-white",
          !isDone && !isCurrent && "border-slate-300 bg-white text-slate-500",
        )}
      >
        {isDone ? <Check aria-hidden="true" className="size-4" /> : position}
      </span>
      <span
        className={cn(
          "hidden text-xs font-bold tracking-wide uppercase sm:block",
          isCurrent ? "text-brand-navy-deep" : "text-muted-foreground",
        )}
      >
        {item.label}
      </span>
      <span className="sr-only">
        {item.label}
        {isDone ? " (concluída)" : ""}
      </span>
    </li>
  )
}
