import type { HowItWorksStep } from "@/types/how-it-works-step.interface"

interface HowItWorksItemProps {
  step: HowItWorksStep
  position: number
}

export function HowItWorksItem({ step, position }: HowItWorksItemProps) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-sm">
      <span aria-hidden="true" className="font-heading text-5xl leading-none font-black text-brand-green-text">
        {String(position).padStart(2, "0")}
      </span>
      <h3 className="font-heading text-lg font-black text-brand-navy-deep">{step.title}</h3>
      <p className="text-sm text-muted-foreground">{step.description}</p>
    </li>
  )
}
