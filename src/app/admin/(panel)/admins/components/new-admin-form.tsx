"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { createAdminAction } from "@/app/actions/admin-management"
import { FormTextField } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { useAdminFormSubmit } from "@/hooks/use-admin-form-submit"
import { managedAdminFormSchema, type ManagedAdminFormInput } from "@/lib/validations/managed-admin.schema"
import type { CreatedManagedAdmin } from "@/types/api/managed-admin.interface"

interface NewAdminFormProps {
  onCreated: (data: CreatedManagedAdmin) => void
  onBusyChange: (busy: boolean) => void
}

const DEFAULTS: ManagedAdminFormInput = { nome: "", email: "" }

export function NewAdminForm({ onCreated, onBusyChange }: NewAdminFormProps) {
  const form = useForm<ManagedAdminFormInput, unknown, ManagedAdminFormInput>({
    resolver: zodResolver(managedAdminFormSchema),
    defaultValues: DEFAULTS,
  })
  const { onSubmit, isBusy } = useAdminFormSubmit(form, {
    submit: (values) => createAdminAction(values),
    defaults: DEFAULTS,
    errorTitle: "Não foi possível criar o admin",
    // Quem recebe decide o refresh (sem perder a senha mostrada).
    refreshOnSuccess: false,
    onSuccess: onCreated,
    onBusyChange,
  })

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-6" aria-label="Novo admin">
      <FieldGroup>
        <FormTextField control={form.control} name="nome" label="Nome" idPrefix="new-admin" maxLength={160} />
        <FormTextField control={form.control} name="email" label="E-mail" type="email" idPrefix="new-admin" maxLength={254} />
      </FieldGroup>
      <Button type="submit" disabled={isBusy} className="w-fit">
        {isBusy ? "Criando..." : "Criar admin"}
      </Button>
    </form>
  )
}
