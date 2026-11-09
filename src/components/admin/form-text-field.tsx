"use client"

import type { HTMLInputTypeAttribute } from "react"
import { type Control, Controller, type FieldPath, type FieldValues } from "react-hook-form"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface FormTextFieldProps<TValues extends FieldValues, TOutput> {
  control: Control<TValues, unknown, TOutput>
  name: FieldPath<TValues>
  label: string
  /** Prefixo do id (evita ids repetidos quando há vários formulários na tela). */
  idPrefix: string
  type?: HTMLInputTypeAttribute
  inputMode?: "text" | "numeric" | "decimal" | "url"
  placeholder?: string
  description?: string
  maxLength?: number
  multiline?: boolean
  className?: string
  /** Chamado com o novo valor depois de atualizar o campo (ex.: gerar o slug a partir do nome). */
  onValueChange?: (value: string) => void
}

/** Campo de texto de formulário do admin (Input ou Textarea) com label, dica e erro acessíveis. */
export function FormTextField<TValues extends FieldValues, TOutput>({
  control,
  name,
  label,
  idPrefix,
  type = "text",
  inputMode,
  placeholder,
  description,
  maxLength,
  multiline = false,
  className,
  onValueChange,
}: FormTextFieldProps<TValues, TOutput>) {
  const id = `${idPrefix}-${name.replace(/\./g, "-")}`
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const describedBy = [description && descriptionId, fieldState.invalid && errorId].filter(Boolean).join(" ") || undefined
        const commonProps = {
          name: field.name,
          ref: field.ref,
          onBlur: field.onBlur,
          value: String(field.value ?? ""),
          id,
          placeholder,
          maxLength,
          "aria-invalid": fieldState.invalid,
          "aria-describedby": describedBy,
          onChange: (event: { target: { value: string } }) => {
            field.onChange(event.target.value)
            onValueChange?.(event.target.value)
          },
        }
        return (
          <Field data-invalid={fieldState.invalid} className={className}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {multiline ? <Textarea {...commonProps} rows={4} /> : <Input {...commonProps} type={type} inputMode={inputMode} />}
            {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
            <FieldError id={errorId} errors={[fieldState.error]} />
          </Field>
        )
      }}
    />
  )
}
