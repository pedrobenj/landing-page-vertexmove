"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { loginAdmin } from "@/app/actions/admin-auth"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validations/admin-login.schema"

export function AdminLoginForm() {
  const [isPending, startTransition] = useTransition()
  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  })

  function onSubmit(values: AdminLoginInput) {
    startTransition(async () => {
      const response = await loginAdmin(values)
      if (response?.error) toast.error(response.title ?? "Não foi possível entrar")
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="admin-email">E-mail</FieldLabel>
              <Input {...field} id="admin-email" type="email" autoComplete="email" aria-invalid={fieldState.invalid} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="admin-password">Senha</FieldLabel>
              <Input {...field} id="admin-password" type="password" autoComplete="current-password" aria-invalid={fieldState.invalid} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Button type="submit" size="xl" disabled={isPending}>
          {isPending ? "Entrando..." : "Entrar"}
        </Button>
      </FieldGroup>
    </form>
  )
}
