import type { HowItWorksStep } from "@/types/how-it-works-step.interface"

interface HowItWorksItemProps {
  step: HowItWorksStep
  position: number
}

export function HowItWorksItem({ step, position }: HowItWorksItemProps) {
  return (
    <li className="flex gap-4">
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cta font-heading font-extrabold text-cta-foreground"
      >
        {position}
      </span>
      <div>
        <h3 className="font-bold text-brand-navy">{step.title}</h3>
        <p className="text-sm text-muted-foreground">{step.description}</p>
      </div>
    </li>
  )
}
