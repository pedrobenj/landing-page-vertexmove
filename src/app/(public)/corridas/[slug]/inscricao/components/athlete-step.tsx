"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Info } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { FieldGroup } from "@/components/ui/field"
import { formatCpfInput, formatDateInput, formatPhoneInput } from "@/lib/utils"
import { athleteStepSchema, type AthleteStepData, type AthleteStepValues } from "@/lib/validations/registration.schema"

import { MaskedTextField } from "./masked-text-field"
import { StepActions } from "./step-actions"
import { StepHeading } from "./step-heading"

interface AthleteStepProps {
  defaultValues: AthleteStepValues | null
  /** A API respondeu `IDENTIDADES_CONFLITANTES`: marca CPF e WhatsApp ao abrir a etapa. */
  identityConflict: boolean
  onBack: () => void
  onSubmit: (data: AthleteStepData) => void
}

const EMPTY_ATHLETE: AthleteStepValues = { nomeCompleto: "", dataNascimento: "", cpf: "", whatsapp: "", email: "" }
const CONFLICT_MESSAGE = "CPF e WhatsApp pertencem a cadastros diferentes. Confira os dois."

/** Etapa 2: dados do atleta, com máscaras. CPF e WhatsApp são opcionais, mas um dos dois é obrigatório. */
export function AthleteStep({ defaultValues, identityConflict, onBack, onSubmit }: AthleteStepProps) {
  const form = useForm<AthleteStepValues, unknown, AthleteStepData>({
    resolver: zodResolver(athleteStepSchema),
    defaultValues: defaultValues ?? EMPTY_ATHLETE,
  })

  useEffect(() => {
    if (!identityConflict) return
    form.setError("cpf", { type: "server", message: CONFLICT_MESSAGE })
    form.setError("whatsapp", { type: "server", message: CONFLICT_MESSAGE }, { shouldFocus: true })
  }, [identityConflict, form])

  return (
    <form onSubmit={(formEvent) => form.handleSubmit(onSubmit)(formEvent)} noValidate className="flex flex-col gap-8">
      <StepHeading title="Seus dados" description="Os dados do atleta que vai correr." />

      <FieldGroup>
        <MaskedTextField control={form.control} name="nomeCompleto" id="athlete-name" label="Nome completo" autoComplete="name" />
        <MaskedTextField
          control={form.control}
          name="dataNascimento"
          id="athlete-birth-date"
          label="Data de nascimento"
          placeholder="DD/MM/AAAA"
          inputMode="numeric"
          autoComplete="bday"
          format={formatDateInput}
        />

        <p className="flex gap-2 rounded-xl bg-brand-green/10 p-4 text-sm text-brand-navy-deep">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-green-text" />
          <span>
            Informe o CPF ou o WhatsApp — <strong>recomendamos informar os dois</strong>: eles servem para consultar a
            sua inscrição depois, sem login.
          </span>
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <MaskedTextField
            control={form.control}
            name="cpf"
            id="athlete-cpf"
            label="CPF"
            placeholder="000.000.000-00"
            inputMode="numeric"
            format={formatCpfInput}
          />
          <MaskedTextField
            control={form.control}
            name="whatsapp"
            id="athlete-whatsapp"
            label="WhatsApp"
            placeholder="(85) 90000-0000"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            format={formatPhoneInput}
          />
        </div>

        <MaskedTextField
          control={form.control}
          name="email"
          id="athlete-email"
          label="E-mail (opcional)"
          type="email"
          autoComplete="email"
        />
      </FieldGroup>

      <StepActions onBack={onBack} />
    </form>
  )
}
