"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { createDocumentAction } from "@/app/actions/admin-documents"
import { FormTextField } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field"
import { RadioGroup } from "@/components/ui/radio-group"
import { useAdminFormSubmit } from "@/hooks/use-admin-form-submit"
import { DOCUMENT_TYPE_OPTIONS } from "@/lib/utils/document-types"
import { documentFormSchema, type DocumentFormData, type DocumentFormInput } from "@/lib/validations/document.schema"

import { DocumentTypeOption } from "./document-type-option"

interface DocumentFormProps {
  eventId: number
  defaultValues: DocumentFormInput
  onSaved: () => void
}

/** Nova versão de regulamento ou termo (não há edição: documentos são imutáveis). */
export function DocumentForm({ eventId, defaultValues, onSaved }: DocumentFormProps) {
  const form = useForm<DocumentFormInput, unknown, DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues,
  })
  const { onSubmit, isBusy } = useAdminFormSubmit(form, {
    submit: (values) => createDocumentAction(eventId, values),
    defaults: defaultValues,
    errorTitle: "Não foi possível publicar a nova versão",
    onSuccess: onSaved,
  })
  const idPrefix = "document-new"

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Nova versão do documento" className="flex flex-col gap-4">
      <fieldset disabled={isBusy} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Controller
          name="tipo"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet className="sm:col-span-2" data-invalid={fieldState.invalid}>
              <FieldLegend variant="label">Tipo</FieldLegend>
              <RadioGroup name={field.name} value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                {DOCUMENT_TYPE_OPTIONS.map((option) => (
                  <DocumentTypeOption key={option.value} idPrefix={idPrefix} value={option.value} label={option.label} />
                ))}
              </RadioGroup>
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />
        <FormTextField idPrefix={idPrefix} control={form.control} name="versao" label="Versão" placeholder="2.0" maxLength={20} />
        <FormTextField
          idPrefix={idPrefix}
          control={form.control}
          name="vigenteEm"
          label="Vale a partir de"
          type="datetime-local"
          description="Horário de Fortaleza."
        />
        <FormTextField idPrefix={idPrefix} control={form.control} name="titulo" label="Título" className="sm:col-span-2" maxLength={150} />
        <FormTextField
          idPrefix={idPrefix}
          control={form.control}
          name="url"
          label="URL do arquivo (PDF)"
          type="url"
          inputMode="url"
          placeholder="https://"
          className="sm:col-span-2"
        />
        <FormTextField
          idPrefix={idPrefix}
          control={form.control}
          name="hashSha256"
          label="Hash SHA-256 do arquivo"
          maxLength={70}
          className="sm:col-span-2"
          description="Prova de qual arquivo o atleta aceitou. No terminal: shasum -a 256 arquivo.pdf"
        />
      </fieldset>
      <Button type="submit" disabled={isBusy} className="w-full sm:w-fit">
        {isBusy ? "Publicando..." : "Publicar nova versão"}
      </Button>
    </form>
  )
}
