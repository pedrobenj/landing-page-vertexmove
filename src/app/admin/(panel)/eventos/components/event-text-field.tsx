import type { HTMLInputTypeAttribute } from "react"
import { type Control, Controller } from "react-hook-form"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { AdminEventFormData, AdminEventFormInput } from "@/lib/validations/admin-event.schema"

interface EventTextFieldProps {
  control: Control<AdminEventFormInput, unknown, AdminEventFormData>
  name: keyof AdminEventFormInput
  label: string
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

/** Campo de texto do formulário de corrida (Input ou Textarea) com label, dica e erro acessíveis. */
export function EventTextField({
  control,
  name,
  label,
  type = "text",
  inputMode,
  placeholder,
  description,
  maxLength,
  multiline = false,
  className,
  onValueChange,
}: EventTextFieldProps) {
  const id = `event-${name}`
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const describedBy = [description && descriptionId, fieldState.invalid && errorId].filter(Boolean).join(" ") || undefined
        const commonProps = {
          ...field,
          id,
          placeholder,
          maxLength,
          "aria-invalid": fieldState.invalid,
          "aria-describedby": describedBy,
        }
        return (
          <Field data-invalid={fieldState.invalid} className={className}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {multiline ? (
              <Textarea
                {...commonProps}
                rows={5}
                onChange={(event) => {
                  field.onChange(event)
                  onValueChange?.(event.target.value)
                }}
              />
            ) : (
              <Input
                {...commonProps}
                type={type}
                inputMode={inputMode}
                onChange={(event) => {
                  field.onChange(event)
                  onValueChange?.(event.target.value)
                }}
              />
            )}
            {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
            <FieldError id={errorId} errors={[fieldState.error]} />
          </Field>
        )
      }}
    />
  )
}
