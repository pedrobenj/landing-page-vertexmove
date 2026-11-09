"use client"

import { type Control, Controller, type FieldPath, type FieldValues } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"

interface FormCheckboxFieldProps<TValues extends FieldValues, TOutput> {
  control: Control<TValues, unknown, TOutput>
  name: FieldPath<TValues>
  label: string
  idPrefix: string
}

/** Checkbox booleano de formulário do admin (ex.: "Ativo"). */
export function FormCheckboxField<TValues extends FieldValues, TOutput>({ control, name, label, idPrefix }: FormCheckboxFieldProps<TValues, TOutput>) {
  const id = `${idPrefix}-${name.replace(/\./g, "-")}`
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field orientation="horizontal">
          <Checkbox
            ref={field.ref}
            id={id}
            name={field.name}
            checked={field.value === true}
            onCheckedChange={(checked) => field.onChange(checked === true)}
            onBlur={field.onBlur}
          />
          <FieldLabel htmlFor={id} className="font-normal">
            {label}
          </FieldLabel>
        </Field>
      )}
    />
  )
}
