"use client"

import type { ReactNode } from "react"
import { type Control, Controller, type FieldPath, type FieldValues } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"

interface TermsCheckboxFieldProps<T extends FieldValues, TOutput> {
  control: Control<T, unknown, TOutput>
  name: FieldPath<T>
  id: string
  children: ReactNode
}

/** Checkbox de aceite em card, com o texto (e links) como label. */
export function TermsCheckboxField<T extends FieldValues, TOutput>({ control, name, id, children }: TermsCheckboxFieldProps<T, TOutput>) {
  const errorId = `${id}-error`
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          orientation="horizontal"
          className="rounded-2xl border-2 border-border p-4 has-data-[state=checked]:border-brand-navy-deep has-data-[state=checked]:bg-brand-navy/5"
        >
          <Checkbox
            id={id}
            ref={field.ref}
            name={field.name}
            checked={field.value === true}
            onCheckedChange={(checked) => field.onChange(checked === true)}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid}
            aria-describedby={fieldState.invalid ? errorId : undefined}
            className="mt-0.5 size-5"
          />
          <FieldContent>
            <FieldLabel htmlFor={id} className="block leading-relaxed font-normal text-foreground">
              {children}
            </FieldLabel>
            <FieldError id={errorId} errors={[fieldState.error]} />
          </FieldContent>
        </Field>
      )}
    />
  )
}
