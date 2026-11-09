interface StepHeadingProps {
  title: string
  description?: string
}

/** Título da etapa. Recebe o foco na troca de etapa (`data-step-heading`, ver `RegistrationWizard`). */
export function StepHeading({ title, description }: StepHeadingProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 data-step-heading tabIndex={-1} className="font-heading text-2xl font-black text-brand-navy-deep outline-none sm:text-3xl">
        {title}
      </h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
}
