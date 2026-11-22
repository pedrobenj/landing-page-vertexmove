"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { savePartnerRaceAction } from "@/app/actions/admin-partner-races"
import { FormCheckboxField, FormTextField } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { useAdminFormSubmit } from "@/hooks/use-admin-form-submit"
import { partnerRaceFormSchema, type PartnerRaceFormData, type PartnerRaceFormInput } from "@/lib/validations/partner-race.schema"

interface PartnerRaceFormProps {
  defaultValues: PartnerRaceFormInput
  raceId?: number
  /** `false` para papéis só de leitura: esconde o botão de salvar (a API também recusa com 403). */
  canManage?: boolean
}

const ID_PREFIX = "partner-race"

export function PartnerRaceForm({ defaultValues, raceId, canManage = true }: PartnerRaceFormProps) {
  const router = useRouter()
  const form = useForm<PartnerRaceFormInput, unknown, PartnerRaceFormData>({
    resolver: zodResolver(partnerRaceFormSchema),
    defaultValues,
  })

  const { onSubmit, isBusy } = useAdminFormSubmit(form, {
    submit: (values) => savePartnerRaceAction(values, raceId),
    defaults: defaultValues,
    errorTitle: "Não foi possível salvar a corrida parceira",
    // Volta para a lista (a transição segura o "Salvando..." até a nova página).
    refreshOnSuccess: false,
    onSuccess: () => router.push("/admin/corridas-parceiras"),
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-2xl flex-col gap-8" aria-label="Corrida parceira">
      <FieldGroup>
        <FormTextField control={form.control} name="nome" label="Nome da corrida" idPrefix={ID_PREFIX} maxLength={160} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField control={form.control} name="dataEvento" label="Data" type="date" idPrefix={ID_PREFIX} />
          <FormTextField
            control={form.control}
            name="distancias"
            label="Distâncias"
            idPrefix={ID_PREFIX}
            placeholder="5 km, 10 km"
            description="Separe por vírgula (até 10)."
          />
        </div>
        <FormTextField control={form.control} name="localNome" label="Local" idPrefix={ID_PREFIX} maxLength={160} />
        <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
          <FormTextField control={form.control} name="cidade" label="Cidade" idPrefix={ID_PREFIX} maxLength={80} />
          <FormTextField control={form.control} name="uf" label="UF" idPrefix={ID_PREFIX} maxLength={2} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField control={form.control} name="cupom" label="Cupom" idPrefix={ID_PREFIX} maxLength={40} placeholder="VERTEX10" />
          <FormTextField
            control={form.control}
            name="descontoPercentual"
            label="Desconto (%)"
            idPrefix={ID_PREFIX}
            inputMode="numeric"
            placeholder="10"
          />
        </div>
        <FormTextField
          control={form.control}
          name="realizacao"
          label="Realização (opcional)"
          idPrefix={ID_PREFIX}
          maxLength={160}
          placeholder="Assessoria ou organização"
        />
        <FormTextField
          control={form.control}
          name="urlInscricao"
          label="Link de inscrição"
          type="url"
          inputMode="url"
          idPrefix={ID_PREFIX}
          placeholder="https://"
          description="Página de inscrição da organizadora (https)."
        />
        <FormTextField
          control={form.control}
          name="imagemCapaUrl"
          label="Imagem de capa (opcional)"
          type="url"
          inputMode="url"
          idPrefix={ID_PREFIX}
          placeholder="https://"
        />
        <FormTextField
          control={form.control}
          name="ordem"
          label="Ordem"
          idPrefix={ID_PREFIX}
          inputMode="numeric"
          description="Menor aparece primeiro no site; empate pela data."
          className="max-w-40"
        />
        <FormCheckboxField control={form.control} name="ativo" label="Ativa (aparece no site até a data da corrida)" idPrefix={ID_PREFIX} />
      </FieldGroup>

      {canManage && (
        <Button type="submit" size="xl" disabled={isBusy} className="w-fit">
          {isBusy ? "Salvando..." : "Salvar corrida parceira"}
        </Button>
      )}
    </form>
  )
}
