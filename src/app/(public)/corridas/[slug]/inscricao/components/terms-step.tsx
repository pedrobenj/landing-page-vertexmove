"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { type Resolver, useForm } from "react-hook-form"

import { FieldGroup } from "@/components/ui/field"
import { termsStepSchema, type TermsStepData, type TermsStepValues } from "@/lib/validations/registration.schema"
import type { PublicDocument } from "@/types/api/public-event-detail.interface"

import { StepActions } from "./step-actions"
import { StepHeading } from "./step-heading"
import { TermsCheckboxField } from "./terms-checkbox-field"

interface TermsStepProps {
  regulation: PublicDocument
  liabilityTerm: PublicDocument
  defaultValues: TermsStepValues | null
  onBack: () => void
  onSubmit: (data: TermsStepValues) => void
}

// O schema exige `true`, mas os checkboxes começam desmarcados (`false`).
const termsResolver = zodResolver(termsStepSchema) as Resolver<TermsStepValues, unknown, TermsStepData>
const linkClassName = "font-semibold text-brand-navy underline underline-offset-4"
const EMPTY_TERMS: TermsStepValues = { aceitaRegulamento: false, aceitaTermo: false, aceitaPrivacidade: false }

/** Etapa 3: aceite do regulamento e do termo (versões vigentes) e da política de privacidade. */
export function TermsStep({ regulation, liabilityTerm, defaultValues, onBack, onSubmit }: TermsStepProps) {
  const form = useForm<TermsStepValues, unknown, TermsStepData>({
    resolver: termsResolver,
    defaultValues: defaultValues ?? EMPTY_TERMS,
  })

  return (
    <form onSubmit={(formEvent) => form.handleSubmit(onSubmit)(formEvent)} noValidate className="flex flex-col gap-8">
      <StepHeading
        title="Termos"
        description="Leia os documentos da prova. O aceite fica registrado junto com a sua inscrição."
      />

      <FieldGroup className="gap-3">
        <TermsCheckboxField control={form.control} name="aceitaRegulamento" id="terms-regulation">
          Li e aceito o{" "}
          <a href={regulation.url} target="_blank" rel="noopener noreferrer" className={linkClassName}>
            regulamento da prova
            <span className="sr-only"> (abre em nova aba)</span>
          </a>{" "}
          <span className="text-muted-foreground">(versão {regulation.versao})</span>.
        </TermsCheckboxField>
        <TermsCheckboxField control={form.control} name="aceitaTermo" id="terms-liability">
          Li e aceito o{" "}
          <a href={liabilityTerm.url} target="_blank" rel="noopener noreferrer" className={linkClassName}>
            termo de responsabilidade
            <span className="sr-only"> (abre em nova aba)</span>
          </a>{" "}
          <span className="text-muted-foreground">(versão {liabilityTerm.versao})</span> e declaro estar em condições
          de saúde para participar.
        </TermsCheckboxField>
        <TermsCheckboxField control={form.control} name="aceitaPrivacidade" id="terms-privacy">
          Li e aceito a{" "}
          <Link href="/privacidade" target="_blank" className={linkClassName}>
            política de privacidade
            <span className="sr-only"> (abre em nova aba)</span>
          </Link>
          .
        </TermsCheckboxField>
      </FieldGroup>

      <StepActions onBack={onBack} />
    </form>
  )
}
