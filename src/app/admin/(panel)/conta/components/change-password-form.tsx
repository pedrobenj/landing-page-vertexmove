"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { changeOwnPasswordAction } from "@/app/actions/admin-management"
import { FormTextField } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { useHydrated } from "@/hooks/use-hydrated"
import { FieldGroup } from "@/components/ui/field"
import { isFormField } from "@/lib/utils/is-form-field"
import {
  ADMIN_PASSWORD_MIN_LENGTH,
  changeOwnPasswordFormSchema,
  type ChangeOwnPasswordFormData,
  type ChangeOwnPasswordFormInput,
} from "@/lib/validations/managed-admin.schema"

const DEFAULTS: ChangeOwnPasswordFormInput = { senhaAtual: "", novaSenha: "", confirmacao: "" }
const ERROR_TITLE = "Não foi possível trocar a senha"

/**
 * Troca da própria senha. No sucesso a action limpa a sessão e redireciona ao login (o backend derruba
 * todas as sessões, inclusive esta) e não retorna; só os erros voltam para cá.
 */
export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition()
  const hydrated = useHydrated()
  const form = useForm<ChangeOwnPasswordFormInput, unknown, ChangeOwnPasswordFormData>({
    resolver: zodResolver(changeOwnPasswordFormSchema),
    defaultValues: DEFAULTS,
  })

  const onSubmit = form.handleSubmit(() => {
    startTransition(async () => {
      let response
      try {
        response = await changeOwnPasswordAction(form.getValues())
      } catch {
        toast.error(`${ERROR_TITLE}. Verifique sua conexão e tente de novo.`)
        return
      }
      if (!response?.error) return
      if (response.field && isFormField(DEFAULTS, response.field)) {
        form.setError(response.field, { message: response.error }, { shouldFocus: true })
      }
      toast.error(response.title ?? ERROR_TITLE, { description: response.error })
    })
  })

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-6" aria-label="Trocar senha">
      <FieldGroup>
        <FormTextField control={form.control} name="senhaAtual" label="Senha atual" type="password" idPrefix="password" />
        <FormTextField
          control={form.control}
          name="novaSenha"
          label="Nova senha"
          type="password"
          idPrefix="password"
          description={`Pelo menos ${ADMIN_PASSWORD_MIN_LENGTH} caracteres. Evite senhas óbvias.`}
        />
        <FormTextField control={form.control} name="confirmacao" label="Confirme a nova senha" type="password" idPrefix="password" />
      </FieldGroup>
      <Button type="submit" disabled={!hydrated || isPending || form.formState.isSubmitting} className="w-fit">
        {isPending ? "Trocando..." : "Trocar senha"}
      </Button>
    </form>
  )
}
