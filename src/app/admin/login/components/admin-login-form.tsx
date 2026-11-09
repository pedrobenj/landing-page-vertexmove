"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"
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
    defaultValues: { email: "", senha: "" },
  })

  function onSubmit(values: AdminLoginInput) {
    startTransition(async () => {
      // Em sucesso a action redireciona ao painel e não retorna. Sem retry: o backend bloqueia após 5 erros.
      const response = await loginAdmin(values)
      if (response?.error) {
        toast.error(response.title ?? "Não foi possível entrar", { description: response.error })
        form.resetField("senha")
      }
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
              <Input
                {...field}
                id="admin-email"
                type="email"
                inputMode="email"
                autoComplete="username"
                className="h-12 rounded-xl"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="senha"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="admin-senha">Senha</FieldLabel>
              <Input
                {...field}
                id="admin-senha"
                type="password"
                autoComplete="current-password"
                className="h-12 rounded-xl"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Button type="submit" variant="cta" size="xl" className="w-full normal-case tracking-normal" disabled={isPending}>
          {isPending ? "Entrando..." : "Entrar"}
          {!isPending && <ArrowRight aria-hidden="true" />}
        </Button>
      </FieldGroup>
    </form>
  )
}
