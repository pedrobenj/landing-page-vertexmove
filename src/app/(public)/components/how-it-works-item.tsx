import { StaggerItem } from "@/components/motion"
import { cn } from "@/lib/utils"
import type { HowItWorksStep } from "@/types/how-it-works-step.interface"

import { STEP_RISE_CLASSES } from "./how-it-works-steps"

interface HowItWorksItemProps {
  step: HowItWorksStep
  position: number
}

/** Degrau da escada: número, título e frase, sobre uma linha verde que sobe a cada passo. */
export function HowItWorksItem({ step, position }: HowItWorksItemProps) {
  return (
    <StaggerItem
      className={cn(
        "relative flex flex-col gap-2 border-l-4 border-brand-green pl-4 lg:border-t-4 lg:border-l-0 lg:pt-4 lg:pl-0",
        STEP_RISE_CLASSES[position - 1],
      )}
    >
      <span aria-hidden="true" className="font-heading text-sm font-black tracking-widest text-brand-green-text">
        DEGRAU {String(position).padStart(2, "0")}
      </span>
      <h3 className="font-heading text-lg font-black text-brand-navy-deep">{step.title}</h3>
      <p className="text-sm text-muted-foreground">{step.description}</p>
    </StaggerItem>
  )
}
