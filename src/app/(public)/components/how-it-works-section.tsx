import { StaggerGroup } from "@/components/motion"
import { SectionBand, SectionHeading } from "@/components/sections"

import { HowItWorksItem } from "./how-it-works-item"
import { HOW_IT_WORKS_STEPS } from "./how-it-works-steps"

export function HowItWorksSection() {
  return (
    <SectionBand aria-labelledby="como-funciona-title">
      <SectionHeading
        id="como-funciona-title"
        eyebrow="Passo a passo"
        title="Como funciona"
        description="Da inscrição à medalha, em poucos passos."
      />
      <StaggerGroup as="ol" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <HowItWorksItem key={step.title} step={step} position={index + 1} />
        ))}
      </StaggerGroup>
    </SectionBand>
  )
}
