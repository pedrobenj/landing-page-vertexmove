"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { createDistanceAction, updateDistanceAction } from "@/app/actions/admin-distances"
import { FormCheckboxField, FormTextField } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { useAdminFormSubmit } from "@/hooks/use-admin-form-submit"
import { distanceFormSchema, type DistanceFormData, type DistanceFormInput } from "@/lib/validations/distance.schema"

interface DistanceFormProps {
  eventId: number
  /** Sem id: cadastro. */
  distanceId?: number
  defaultValues: DistanceFormInput
  onSaved: () => void
  /** Envio em andamento (o FormDialog não fecha enquanto `true`). */
  onBusyChange?: (busy: boolean) => void
}

export function DistanceForm({ eventId, distanceId, defaultValues, onSaved, onBusyChange }: DistanceFormProps) {
  const form = useForm<DistanceFormInput, unknown, DistanceFormData>({
    resolver: zodResolver(distanceFormSchema),
    defaultValues,
  })
  const { onSubmit, isBusy } = useAdminFormSubmit(form, {
    submit: (values) =>
      distanceId === undefined ? createDistanceAction(eventId, values) : updateDistanceAction(eventId, distanceId, values),
    defaults: defaultValues,
    errorTitle: "Não foi possível salvar a distância",
    onSuccess: onSaved,
    onBusyChange,
  })
  const idPrefix = `distance-${distanceId ?? "new"}`

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Distância" className="flex flex-col gap-4">
      <fieldset disabled={isBusy} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <FormTextField idPrefix={idPrefix} control={form.control} name="nome" label="Nome" placeholder="5 km" maxLength={80} />
        <FormTextField
          idPrefix={idPrefix}
          control={form.control}
          name="distanciaMetros"
          label="Distância (metros)"
          inputMode="numeric"
          placeholder="5000"
          description="Ex.: 5000 para 5 km; 21097 para a meia."
        />
        <FormTextField idPrefix={idPrefix} control={form.control} name="capacidadeTotal" label="Vagas" inputMode="numeric" />
        <FormTextField idPrefix={idPrefix} control={form.control} name="horarioLargada" label="Largada (opcional)" type="time" description="Se diferente da largada geral." />
        <FormTextField idPrefix={idPrefix} control={form.control} name="percursoUrl" label="URL do percurso (opcional)" type="url" inputMode="url" placeholder="https://" />
        <FormTextField idPrefix={idPrefix} control={form.control} name="ordem" label="Ordem de exibição" inputMode="numeric" />
        <FormTextField idPrefix={idPrefix} control={form.control} name="descricao" label="Descrição (opcional)" multiline className="sm:col-span-2" />
        <FormCheckboxField idPrefix={idPrefix} control={form.control} name="ativo" label="Ativa (aceita inscrições)" />
      </fieldset>
      <Button type="submit" disabled={isBusy} className="w-full sm:w-fit">
        {isBusy ? "Salvando..." : "Salvar distância"}
      </Button>
    </form>
  )
}
