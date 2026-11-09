"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { createPriceTierAction, updatePriceTierAction } from "@/app/actions/admin-distances"
import { FormCheckboxField, FormTextField } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { useAdminFormSubmit } from "@/hooks/use-admin-form-submit"
import { priceTierFormSchema, type PriceTierFormData, type PriceTierFormInput } from "@/lib/validations/price-tier.schema"

interface PriceTierFormProps {
  eventId: number
  distanceId: number
  /** Sem id: cadastro. */
  priceTierId?: number
  defaultValues: PriceTierFormInput
  onSaved: () => void
}

export function PriceTierForm({ eventId, distanceId, priceTierId, defaultValues, onSaved }: PriceTierFormProps) {
  const form = useForm<PriceTierFormInput, unknown, PriceTierFormData>({
    resolver: zodResolver(priceTierFormSchema),
    defaultValues,
  })
  const { onSubmit, isBusy } = useAdminFormSubmit(form, {
    submit: (values) =>
      priceTierId === undefined
        ? createPriceTierAction(eventId, distanceId, values)
        : updatePriceTierAction(eventId, distanceId, priceTierId, values),
    defaults: defaultValues,
    errorTitle: "Não foi possível salvar o lote",
    onSuccess: onSaved,
  })
  const idPrefix = `tier-${distanceId}-${priceTierId ?? "new"}`

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Lote" className="flex flex-col gap-4">
      <fieldset disabled={isBusy} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <FormTextField idPrefix={idPrefix} control={form.control} name="nome" label="Nome do lote" placeholder="1º lote" maxLength={80} />
        <FormTextField idPrefix={idPrefix} control={form.control} name="precoCentavos" label="Preço (R$)" inputMode="decimal" placeholder="89,90" />
        <FormTextField
          idPrefix={idPrefix}
          control={form.control}
          name="inicioEm"
          label="Início das vendas"
          type="datetime-local"
          description="Horário de Fortaleza."
        />
        <FormTextField idPrefix={idPrefix} control={form.control} name="fimEm" label="Fim das vendas" type="datetime-local" />
        <FormTextField
          idPrefix={idPrefix}
          control={form.control}
          name="quantidadeTotal"
          label="Quantidade (opcional)"
          inputMode="numeric"
          description="Vazio: sem limite próprio (vale o limite de vagas)."
        />
        <FormTextField idPrefix={idPrefix} control={form.control} name="ordem" label="Ordem" inputMode="numeric" />
        <FormCheckboxField idPrefix={idPrefix} control={form.control} name="ativo" label="Ativo" />
      </fieldset>
      <p className="text-xs text-muted-foreground">O lote vigente é decidido pelo sistema conforme o período e as vagas.</p>
      <Button type="submit" disabled={isBusy} className="w-full sm:w-fit">
        {isBusy ? "Salvando..." : "Salvar lote"}
      </Button>
    </form>
  )
}
