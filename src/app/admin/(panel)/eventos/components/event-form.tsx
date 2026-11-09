"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { useForm } from "react-hook-form"

import { createAdminEventAction, updateAdminEventAction } from "@/app/actions/admin-events"
import { FormTextField } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { useAdminFormSubmit } from "@/hooks/use-admin-form-submit"
import { toAdminEventFormValues } from "@/lib/utils/admin-event-form-values"
import { queryKeys } from "@/lib/utils/query-keys"
import { slugify } from "@/lib/utils/slugify"
import { adminEventFormSchema, type AdminEventFormData, type AdminEventFormInput } from "@/lib/validations/admin-event.schema"

import { EventFormSection } from "./event-form-section"

interface EventFormProps {
  defaultValues: AdminEventFormInput
  /** Sem id: cadastro. Com id: edição (`PATCH`). */
  eventId?: number
  /** Operador: só leitura, sem salvar. */
  readOnly?: boolean
}

export function EventForm({ defaultValues, eventId, readOnly = false }: EventFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  // Na edição o slug já existe e não muda sozinho; no cadastro segue o nome até ser editado à mão.
  const slugEditedRef = useRef(eventId !== undefined)

  const form = useForm<AdminEventFormInput, unknown, AdminEventFormData>({
    resolver: zodResolver(adminEventFormSchema),
    defaultValues,
  })

  const { onSubmit, isBusy } = useAdminFormSubmit(form, {
    submit: (values) => (eventId === undefined ? createAdminEventAction(values) : updateAdminEventAction(eventId, values)),
    defaults: defaultValues,
    errorTitle: "Não foi possível salvar a corrida",
    // Cadastro navega para a edição (a transição segura o "Salvando..." até a nova página);
    // edição reinicia o form com o que a API devolveu e atualiza a página.
    refreshOnSuccess: eventId !== undefined,
    onSuccess: async (event) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
      if (eventId === undefined) router.push(`/admin/eventos/${event.id}`)
      else form.reset(toAdminEventFormValues(event))
    },
  })

  function handleNameChange(nome: string) {
    if (slugEditedRef.current) return
    form.setValue("slug", slugify(nome), { shouldValidate: form.formState.isSubmitted })
  }

  function handleSlugChange(slug: string) {
    // Apagar o slug volta a gerá-lo a partir do nome.
    slugEditedRef.current = slug !== ""
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Dados da corrida"
      className="flex max-w-4xl flex-col gap-6"
    >
      {/* fieldset desabilitado: modo leitura do operador sem duplicar o formulário. */}
      <fieldset disabled={readOnly || isBusy} className="flex min-w-0 flex-col gap-6">
        <EventFormSection legend="Informações">
          <FormTextField idPrefix="event" control={form.control} name="nome" label="Nome da corrida" maxLength={150} onValueChange={handleNameChange} />
          <FormTextField
            idPrefix="event"
            control={form.control}
            name="slug"
            label="Endereço (slug)"
            description="Aparece no link: /corridas/seu-slug. Gerado a partir do nome."
            maxLength={120}
            onValueChange={handleSlugChange}
          />
          <FormTextField idPrefix="event" control={form.control} name="descricao" label="Descrição" multiline className="md:col-span-2" />
        </EventFormSection>

        <EventFormSection legend="Data e largada">
          <FormTextField idPrefix="event" control={form.control} name="dataEvento" label="Data" type="date" />
          <FormTextField idPrefix="event" control={form.control} name="horarioLargada" label="Horário de largada" type="time" />
        </EventFormSection>

        <EventFormSection legend="Local">
          <FormTextField idPrefix="event" control={form.control} name="localNome" label="Local da largada" placeholder="Aterrinho da Praia de Iracema" />
          <FormTextField idPrefix="event" control={form.control} name="endereco" label="Endereço (opcional)" />
          <FormTextField idPrefix="event" control={form.control} name="complemento" label="Complemento (opcional)" />
          <FormTextField idPrefix="event" control={form.control} name="bairro" label="Bairro (opcional)" />
          <FormTextField idPrefix="event" control={form.control} name="cidade" label="Cidade" />
          <FormTextField idPrefix="event" control={form.control} name="uf" label="UF" maxLength={2} placeholder="CE" />
          <FormTextField idPrefix="event" control={form.control} name="cep" label="CEP (opcional)" inputMode="numeric" placeholder="60165-121" maxLength={9} />
          <div className="hidden md:block" aria-hidden="true" />
          <FormTextField
            idPrefix="event"
            control={form.control}
            name="latitude"
            label="Latitude (opcional)"
            inputMode="decimal"
            placeholder="-3.7253"
            description="Para o mapa da página da corrida."
          />
          <FormTextField idPrefix="event" control={form.control} name="longitude" label="Longitude (opcional)" inputMode="decimal" placeholder="-38.4970" />
        </EventFormSection>

        <EventFormSection legend="Imagens">
          <FormTextField
            idPrefix="event"
            control={form.control}
            name="imagemCapaUrl"
            label="URL da imagem de capa (opcional)"
            type="url"
            inputMode="url"
            placeholder="https://"
          />
          <FormTextField
            idPrefix="event"
            control={form.control}
            name="galeriaUrl"
            label="URL da galeria de fotos (opcional)"
            type="url"
            inputMode="url"
            placeholder="https://"
          />
        </EventFormSection>
      </fieldset>

      {!readOnly && (
        <Button type="submit" size="xl" disabled={isBusy} className="w-full sm:w-fit">
          {isBusy ? "Salvando..." : eventId === undefined ? "Cadastrar corrida" : "Salvar alterações"}
        </Button>
      )}
    </form>
  )
}
