"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createAdminEventAction, updateAdminEventAction } from "@/app/actions/admin-events"
import { Button } from "@/components/ui/button"
import { toAdminEventFormValues } from "@/lib/utils/admin-event-form-values"
import { isFormField } from "@/lib/utils/is-form-field"
import { queryKeys } from "@/lib/utils/query-keys"
import { slugify } from "@/lib/utils/slugify"
import { adminEventFormSchema, type AdminEventFormData, type AdminEventFormInput } from "@/lib/validations/admin-event.schema"

import { EventFormSection } from "./event-form-section"
import { EventTextField } from "./event-text-field"

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
  const [isPending, startTransition] = useTransition()
  const [isRedirecting, setIsRedirecting] = useState(false)
  // Trava síncrona contra duplo envio (o estado do React só atualiza no próximo render).
  const submittingRef = useRef(false)
  // Na edição o slug já existe e não muda sozinho; no cadastro segue o nome até ser editado à mão.
  const slugEditedRef = useRef(eventId !== undefined)

  const form = useForm<AdminEventFormInput, unknown, AdminEventFormData>({
    resolver: zodResolver(adminEventFormSchema),
    defaultValues,
  })

  function handleNameChange(nome: string) {
    if (slugEditedRef.current) return
    form.setValue("slug", slugify(nome), { shouldValidate: form.formState.isSubmitted })
  }

  function handleSlugChange(slug: string) {
    // Apagar o slug volta a gerá-lo a partir do nome.
    slugEditedRef.current = slug !== ""
  }

  function onSubmit() {
    if (submittingRef.current) return
    submittingRef.current = true

    startTransition(async () => {
      let response: Awaited<ReturnType<typeof createAdminEventAction>>
      try {
        // Valores crus do formulário: o servidor valida e converte de novo.
        const values = form.getValues()
        response = eventId === undefined ? await createAdminEventAction(values) : await updateAdminEventAction(eventId, values)
      } catch {
        submittingRef.current = false
        toast.error("Não foi possível salvar a corrida. Verifique sua conexão e tente de novo.")
        return
      }

      if (!response.data) {
        submittingRef.current = false
        if (response.field && isFormField(defaultValues, response.field)) {
          form.setError(response.field, { message: response.error }, { shouldFocus: true })
        }
        toast.error(response.title ?? "Não foi possível salvar a corrida", { description: response.error })
        return
      }

      toast.success(response.title ?? "Corrida salva")
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })

      if (eventId === undefined) {
        setIsRedirecting(true)
        router.push(`/admin/eventos/${response.data.id}`)
        return
      }
      submittingRef.current = false
      form.reset(toAdminEventFormValues(response.data))
      router.refresh()
    })
  }

  const isBusy = form.formState.isSubmitting || isPending || isRedirecting

  return (
    <form
      onSubmit={(event) => form.handleSubmit(onSubmit)(event)}
      noValidate
      aria-label="Dados da corrida"
      className="flex max-w-4xl flex-col gap-6"
    >
      {/* fieldset desabilitado: modo leitura do operador sem duplicar o formulário. */}
      <fieldset disabled={readOnly || isBusy} className="flex min-w-0 flex-col gap-6">
        <EventFormSection legend="Informações">
          <EventTextField control={form.control} name="nome" label="Nome da corrida" maxLength={150} onValueChange={handleNameChange} />
          <EventTextField
            control={form.control}
            name="slug"
            label="Endereço (slug)"
            description="Aparece no link: /corridas/seu-slug. Gerado a partir do nome."
            maxLength={120}
            onValueChange={handleSlugChange}
          />
          <EventTextField control={form.control} name="descricao" label="Descrição" multiline className="md:col-span-2" />
        </EventFormSection>

        <EventFormSection legend="Data e largada">
          <EventTextField control={form.control} name="dataEvento" label="Data" type="date" />
          <EventTextField control={form.control} name="horarioLargada" label="Horário de largada" type="time" />
        </EventFormSection>

        <EventFormSection legend="Local">
          <EventTextField control={form.control} name="localNome" label="Local da largada" placeholder="Aterrinho da Praia de Iracema" />
          <EventTextField control={form.control} name="endereco" label="Endereço (opcional)" />
          <EventTextField control={form.control} name="complemento" label="Complemento (opcional)" />
          <EventTextField control={form.control} name="bairro" label="Bairro (opcional)" />
          <EventTextField control={form.control} name="cidade" label="Cidade" />
          <EventTextField control={form.control} name="uf" label="UF" maxLength={2} placeholder="CE" />
          <EventTextField control={form.control} name="cep" label="CEP (opcional)" inputMode="numeric" placeholder="60165-121" maxLength={9} />
          <div className="hidden md:block" aria-hidden="true" />
          <EventTextField
            control={form.control}
            name="latitude"
            label="Latitude (opcional)"
            inputMode="decimal"
            placeholder="-3.7253"
            description="Para o mapa da página da corrida."
          />
          <EventTextField control={form.control} name="longitude" label="Longitude (opcional)" inputMode="decimal" placeholder="-38.4970" />
        </EventFormSection>

        <EventFormSection legend="Imagens">
          <EventTextField
            control={form.control}
            name="imagemCapaUrl"
            label="URL da imagem de capa (opcional)"
            type="url"
            inputMode="url"
            placeholder="https://"
          />
          <EventTextField
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
