"use client"

import type { ComponentProps, ReactNode } from "react"
import { type Control, Controller, type FieldPath, type FieldValues } from "react-hook-form"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface MaskedTextFieldProps<T extends FieldValues, TOutput> extends Omit<ComponentProps<"input">, "name" | "id" | "defaultValue"> {
  control: Control<T, unknown, TOutput>
  name: FieldPath<T>
  id: string
  label: string
  hint?: ReactNode
  /** Máscara aplicada a cada digitação (ex.: `formatCpfInput`). */
  format?: (value: string) => string
}

/** Campo de texto controlado com label, dica, máscara opcional e mensagem de erro acessível. */
export function MaskedTextField<T extends FieldValues, TOutput>({
  control,
  name,
  id,
  label,
  hint,
  format,
  ...inputProps
}: MaskedTextFieldProps<T, TOutput>) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input
            {...inputProps}
            {...field}
            id={id}
            value={(field.value as string | undefined) ?? ""}
            onChange={(changeEvent) => field.onChange(format ? format(changeEvent.target.value) : changeEvent.target.value)}
            aria-invalid={fieldState.invalid}
            aria-describedby={[hint ? hintId : null, fieldState.invalid ? errorId : null].filter(Boolean).join(" ") || undefined}
            className="h-12 rounded-xl px-4 text-base md:text-base"
          />
          {hint && <FieldDescription id={hintId}>{hint}</FieldDescription>}
          <FieldError id={errorId} errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
