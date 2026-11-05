import { HowItWorksItem } from "./how-it-works-item"
import { HOW_IT_WORKS_STEPS } from "./how-it-works-steps"
import { SectionHeading } from "./section-heading"

export function HowItWorksSection() {
  return (
    <section aria-labelledby="como-funciona-title" className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14">
      <SectionHeading id="como-funciona-title" eyebrow="Passo a passo" title="Como funciona" />
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <HowItWorksItem key={step.title} step={step} position={index + 1} />
        ))}
      </ol>
    </section>
  )
}
