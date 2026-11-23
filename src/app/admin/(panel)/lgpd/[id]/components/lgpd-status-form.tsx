"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { updateLgpdRequestStatusAction } from "@/app/actions/admin-lgpd"
import { FormTextField } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdminFormSubmit } from "@/hooks/use-admin-form-submit"
import { getLgpdRequestStatusLabel } from "@/lib/utils/lgpd-labels"
import { getNextLgpdStatuses } from "@/lib/utils/lgpd-request-rules"
import {
  LGPD_ANSWER_MAX_LENGTH,
  lgpdStatusFormSchema,
  type LgpdStatusFormData,
  type LgpdStatusFormInput,
} from "@/lib/validations/lgpd-status.schema"
import type { AdminLgpdRequest } from "@/types/api/lgpd-request.interface"

interface LgpdStatusFormProps {
  request: Pick<AdminLgpdRequest, "id" | "status" | "resposta">
}

/**
 * Atendimento: só os próximos status permitidos (aberta → em andamento → concluída/recusada). Concluída e
 * recusada são finais e registram a resposta enviada ao titular.
 */
export function LgpdStatusForm({ request }: LgpdStatusFormProps) {
  const nextStatuses = getNextLgpdStatuses(request.status)
  const defaultValues: LgpdStatusFormInput = { status: nextStatuses[0] ?? request.status, resposta: request.resposta ?? "" }
  const form = useForm<LgpdStatusFormInput, unknown, LgpdStatusFormData>({
    resolver: zodResolver(lgpdStatusFormSchema),
    defaultValues,
  })
  const { onSubmit, isBusy } = useAdminFormSubmit(form, {
    submit: (values) => updateLgpdRequestStatusAction(request.id, values),
    defaults: defaultValues,
    errorTitle: "Não foi possível alterar a solicitação",
  })

  return (
    <section aria-labelledby="lgpd-status-title" className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
      <h2 id="lgpd-status-title" className="font-heading font-black text-brand-navy-deep">Atendimento</h2>
      {nextStatuses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Solicitação encerrada como {getLgpdRequestStatusLabel(request.status).toLowerCase()}. O status não muda mais.
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate aria-label="Atendimento da solicitação" className="flex flex-col gap-4">
          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="lgpd-status">Novo status</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="lgpd-status" ref={field.ref} className="w-full sm:w-56" aria-invalid={fieldState.invalid}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {nextStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {getLgpdRequestStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <FormTextField
            control={form.control}
            name="resposta"
            label="Resposta ao titular"
            idPrefix="lgpd"
            multiline
            maxLength={LGPD_ANSWER_MAX_LENGTH}
            description="Obrigatória para Concluída e Recusada (que encerram a solicitação). Envie a resposta pelo contato informado e registre aqui o que foi dito."
          />
          <Button type="submit" disabled={isBusy} className="w-full sm:w-auto sm:self-start">
            {isBusy ? "Salvando..." : "Salvar atendimento"}
          </Button>
        </form>
      )}
    </section>
  )
}
