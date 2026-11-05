"use client"

import { Trash2 } from "lucide-react"
import { Controller, type Control } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { ProductFormData, ProductFormInput } from "@/lib/validations/product.schema"

interface VariantFieldRowProps {
  control: Control<ProductFormInput, unknown, ProductFormData>
  index: number
  /** Tamanhos já salvos não podem ser removidos (histórico de pedidos). */
  canRemove: boolean
  onRemove: () => void
}

export function VariantFieldRow({ control, index, canRemove, onRemove }: VariantFieldRowProps) {
  const labelId = `variant-label-${index}`
  const stockId = `variant-stock-${index}`

  return (
    <li className="flex items-start gap-3">
      <Controller
        name={`variants.${index}.label`}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="flex-1">
            <FieldLabel htmlFor={labelId}>Tamanho</FieldLabel>
            <Input
              {...field}
              id={labelId}
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.invalid ? `${labelId}-error` : undefined}
            />
            <FieldError id={`${labelId}-error`} errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name={`variants.${index}.stock`}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="w-28">
            <FieldLabel htmlFor={stockId}>Estoque</FieldLabel>
            <Input
              {...field}
              id={stockId}
              inputMode="numeric"
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.invalid ? `${stockId}-error` : undefined}
            />
            <FieldError id={`${stockId}-error`} errors={[fieldState.error]} />
          </Field>
        )}
      />
      {canRemove && (
        <Button type="button" variant="ghost" size="icon-lg" className="mt-6" aria-label="Remover tamanho" onClick={onRemove}>
          <Trash2 />
        </Button>
      )}
    </li>
  )
}
