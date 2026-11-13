import { StaggerGroup } from "@/components/motion"
import { SectionBand, SectionHeading } from "@/components/sections"

import { HowItWorksItem } from "./how-it-works-item"
import { HOW_IT_WORKS_STEPS } from "./how-it-works-steps"
import { LookupCallout } from "./lookup-callout"

/** "Como funciona" em escada + atalho para a consulta (substitui as duas seções da referência). */
export function ClimbStepsSection() {
  return (
    <SectionBand aria-labelledby="como-funciona-title">
      <SectionHeading
        id="como-funciona-title"
        eyebrow="Como funciona"
        title="Do primeiro passo ao pódio"
        description="Seis degraus entre o clique e a linha de chegada."
        actions={<LookupCallout />}
      />
      <StaggerGroup as="ol" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <HowItWorksItem key={step.title} step={step} position={index + 1} />
        ))}
      </StaggerGroup>
    </SectionBand>
  )
}
