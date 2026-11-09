import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface StepActionsProps {
  onBack?: () => void
  submitLabel?: string
  isSubmitting?: boolean
  submittingLabel?: string
}

/** Rodapé das etapas: "Voltar" e o botão principal verde com seta (largura total no mobile). */
export function StepActions({ onBack, submitLabel = "Continuar", isSubmitting, submittingLabel }: StepActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <Button type="button" variant="outline" size="xl" className="w-full sm:w-auto" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft aria-hidden="true" />
          Voltar
        </Button>
      ) : (
        <span className="hidden sm:block" />
      )}
      <Button type="submit" variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? (submittingLabel ?? submitLabel) : submitLabel}
        <ArrowRight aria-hidden="true" />
      </Button>
    </div>
  )
}
