"use client"

import { TriangleAlert } from "lucide-react"
import type { Control } from "react-hook-form"

import type { AthleteStepData, AthleteStepValues } from "@/lib/validations/registration.schema"

import { TermsCheckboxField } from "./terms-checkbox-field"

interface LegalGuardianConsentProps {
  control: Control<AthleteStepValues, unknown, AthleteStepData>
}

/**
 * Atleta menor de 18 na data da prova (LGPD, art. 14): aviso + confirmação obrigatória do responsável.
 * A confirmação é validada só no formulário — o contrato da API ainda não tem o campo (§16 do CLAUDE.md).
 */
export function LegalGuardianConsent({ control }: LegalGuardianConsentProps) {
  return (
    <div role="group" aria-labelledby="legal-guardian-title" className="flex flex-col gap-3">
      <div className="flex gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-700" />
        <p>
          <strong id="legal-guardian-title" className="block">
            Atleta menor de 18 anos na data da prova
          </strong>
          A inscrição de menores deve ser feita por um dos pais ou pelo responsável legal, ou com a autorização dele.
        </p>
      </div>
      <TermsCheckboxField control={control} name="responsavelLegal" id="athlete-legal-guardian">
        Sou o responsável legal ou tenho autorização dele para esta inscrição.
      </TermsCheckboxField>
    </div>
  )
}
