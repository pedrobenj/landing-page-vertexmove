"use client"

import { type Control, Controller } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import type { LgpdRequestFormData, LgpdRequestFormInput } from "@/lib/validations/lgpd-request.schema"

interface LgpdConsentFieldProps {
  control: Control<LgpdRequestFormInput, unknown, LgpdRequestFormData>
}

/** Declaração de titularidade: libera o envio (não vai para a API). */
export function LgpdConsentField({ control }: LgpdConsentFieldProps) {
  return (
    <Controller
      name="aceite"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} orientation="horizontal" className="rounded-2xl border-2 border-border p-4 has-data-[state=checked]:border-brand-navy-deep">
          <Checkbox
            id="lgpd-consent"
            ref={field.ref}
            name={field.name}
            checked={field.value === true}
            onCheckedChange={(checked) => field.onChange(checked === true)}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid}
            aria-describedby={fieldState.invalid ? "lgpd-consent-error" : undefined}
            className="mt-0.5 size-5"
          />
          <FieldContent>
            <FieldLabel htmlFor="lgpd-consent" className="block leading-relaxed font-normal text-foreground">
              Declaro que sou o titular dos dados ou o representante legal dele, e que as informações acima são verdadeiras.
            </FieldLabel>
            <FieldError id="lgpd-consent-error" errors={[fieldState.error]} />
          </FieldContent>
        </Field>
      )}
    />
  )
}
