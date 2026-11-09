"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"

import { createKitAction, updateKitAction } from "@/app/actions/admin-kits"
import { FormCheckboxField, FormTextField } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field"
import { useAdminFormSubmit } from "@/hooks/use-admin-form-submit"
import { EMPTY_KIT_PHOTO } from "@/lib/utils/kit-form-values"
import { kitFormSchema, type KitFormData, type KitFormInput, MAX_KIT_PHOTOS } from "@/lib/validations/kit.schema"

import { KitPhotoFieldRow } from "./kit-photo-field-row"

interface KitFormProps {
  eventId: number
  /** Sem id: cadastro. */
  kitId?: number
  defaultValues: KitFormInput
  onSaved: () => void
  /** Envio em andamento (o FormDialog não fecha enquanto `true`). */
  onBusyChange?: (busy: boolean) => void
}

export function KitForm({ eventId, kitId, defaultValues, onSaved, onBusyChange }: KitFormProps) {
  const form = useForm<KitFormInput, unknown, KitFormData>({
    resolver: zodResolver(kitFormSchema),
    defaultValues,
  })
  const photos = useFieldArray({ control: form.control, name: "fotos" })
  const { onSubmit, isBusy } = useAdminFormSubmit(form, {
    submit: (values) => (kitId === undefined ? createKitAction(eventId, values) : updateKitAction(eventId, kitId, values)),
    defaults: defaultValues,
    errorTitle: "Não foi possível salvar o kit",
    onSuccess: onSaved,
    onBusyChange,
  })
  const idPrefix = `kit-${kitId ?? "new"}`
  const photosError = form.formState.errors.fotos

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Kit" className="flex flex-col gap-4">
      <fieldset disabled={isBusy} className="flex min-w-0 flex-col gap-4">
        <FormTextField idPrefix={idPrefix} control={form.control} name="nome" label="Nome do kit" placeholder="Kit completo" maxLength={80} />
        <FormTextField idPrefix={idPrefix} control={form.control} name="descricao" label="O que vem no kit (opcional)" multiline />
        <FormCheckboxField idPrefix={idPrefix} control={form.control} name="ativo" label="Ativo (aparece na inscrição)" />

        <FieldSet>
          <FieldLegend>Fotos</FieldLegend>
          <p className="text-sm text-muted-foreground">Informe a URL de cada foto (o envio de arquivos ainda não está disponível). A ordem da lista é a ordem no site.</p>
          {photos.fields.length > 0 && (
            <ul className="flex flex-col gap-3">
              {photos.fields.map((photo, index) => (
                <KitPhotoFieldRow
                  key={photo.id}
                  control={form.control}
                  index={index}
                  total={photos.fields.length}
                  idPrefix={idPrefix}
                  onMoveUp={() => photos.move(index, index - 1)}
                  onMoveDown={() => photos.move(index, index + 1)}
                  onRemove={() => photos.remove(index)}
                />
              ))}
            </ul>
          )}
          <FieldError errors={[photosError?.root, photosError?.message ? photosError : undefined]} />
          {photos.fields.length < MAX_KIT_PHOTOS && (
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              onClick={() => photos.append({ ...EMPTY_KIT_PHOTO })}
            >
              <Plus aria-hidden="true" /> Adicionar foto
            </Button>
          )}
        </FieldSet>
      </fieldset>
      <Button type="submit" disabled={isBusy} className="w-full sm:w-fit">
        {isBusy ? "Salvando..." : "Salvar kit"}
      </Button>
    </form>
  )
}
