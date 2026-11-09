"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { createShirtSizeAction, updateShirtSizeAction } from "@/app/actions/admin-shirt-sizes"
import { FormCheckboxField, FormTextField } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { useAdminFormSubmit } from "@/hooks/use-admin-form-submit"
import { shirtSizeFormSchema, type ShirtSizeFormData, type ShirtSizeFormInput } from "@/lib/validations/shirt-size.schema"

interface ShirtSizeFormProps {
  /** Sem id: cadastro. */
  shirtSizeId?: number
  defaultValues: ShirtSizeFormInput
  onSaved: () => void
}

export function ShirtSizeForm({ shirtSizeId, defaultValues, onSaved }: ShirtSizeFormProps) {
  const form = useForm<ShirtSizeFormInput, unknown, ShirtSizeFormData>({
    resolver: zodResolver(shirtSizeFormSchema),
    defaultValues,
  })
  const { onSubmit, isBusy } = useAdminFormSubmit(form, {
    submit: (values) => (shirtSizeId === undefined ? createShirtSizeAction(values) : updateShirtSizeAction(shirtSizeId, values)),
    defaults: defaultValues,
    errorTitle: "Não foi possível salvar o tamanho",
    onSuccess: onSaved,
  })
  const idPrefix = `shirt-size-${shirtSizeId ?? "new"}`

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Tamanho de camisa" className="flex flex-col gap-4">
      <fieldset disabled={isBusy} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <FormTextField idPrefix={idPrefix} control={form.control} name="codigo" label="Código" placeholder="GG" maxLength={10} />
        <FormTextField idPrefix={idPrefix} control={form.control} name="ordem" label="Ordem" inputMode="numeric" />
        <FormTextField
          idPrefix={idPrefix}
          control={form.control}
          name="descricao"
          label="Descrição (opcional)"
          placeholder="Extra grande"
          className="sm:col-span-2"
        />
        <FormCheckboxField idPrefix={idPrefix} control={form.control} name="ativo" label="Ativo (disponível nas inscrições)" />
      </fieldset>
      <Button type="submit" disabled={isBusy} className="w-full sm:w-fit">
        {isBusy ? "Salvando..." : "Salvar tamanho"}
      </Button>
    </form>
  )
}
