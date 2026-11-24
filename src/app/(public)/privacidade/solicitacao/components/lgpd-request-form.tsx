"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Send } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import { createLgpdRequestAction } from "@/app/actions/lgpd"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatCpfInput, formatPhoneInput } from "@/lib/utils"
import { isFormField } from "@/lib/utils/is-form-field"
import { LGPD_REQUEST_TYPE_OPTIONS } from "@/lib/utils/lgpd-labels"
import {
  LGPD_MESSAGE_MAX_LENGTH,
  lgpdRequestSchema,
  type LgpdRequestFormData,
  type LgpdRequestFormInput,
} from "@/lib/validations/lgpd-request.schema"

import { LgpdConsentField } from "./lgpd-consent-field"
import { LgpdRequestSuccess } from "./lgpd-request-success"

const DEFAULT_VALUES: LgpdRequestFormInput = {
  tipo: "" as LgpdRequestFormInput["tipo"],
  nome: "",
  cpf: "",
  email: "",
  whatsapp: "",
  mensagem: "",
  aceite: false,
}

const NETWORK_ERROR = "Verifique sua conexão e tente de novo."
const INPUT_CLASS = "h-12 rounded-xl px-4 text-base md:text-base"

/**
 * Solicitação do titular. Os dados vão por server action (POST); nada entra na URL, em query keys ou
 * storage. O sucesso mostra só o protocolo e o prazo: a resposta não revela se o CPF tem cadastro.
 */
export function LgpdRequestForm() {
  const form = useForm<LgpdRequestFormInput, unknown, LgpdRequestFormData>({
    resolver: zodResolver(lgpdRequestSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const mutation = useMutation({
    mutationFn: (values: LgpdRequestFormInput) => createLgpdRequestAction(values),
    // CPF e contatos ficam em `variables`: sem cache depois que a tela desmonta.
    gcTime: 0,
    onSuccess: (response) => {
      if (response.status === 422 && response.field && isFormField(DEFAULT_VALUES, response.field)) {
        form.setError(response.field, { type: "server", message: response.error }, { shouldFocus: true })
      }
    },
  })

  const receipt = mutation.data?.status === 201 ? mutation.data.data : undefined
  if (receipt) return <LgpdRequestSuccess receipt={receipt} />

  const submitError = mutation.isError
    ? NETWORK_ERROR
    : mutation.data && mutation.data.status !== 422
      ? (mutation.data.error ?? NETWORK_ERROR)
      : null

  return (
    <form method="post"
      onSubmit={(event) => form.handleSubmit(() => mutation.mutate(form.getValues()))(event)}
      noValidate
      aria-label="Solicitação sobre seus dados"
      className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-8"
    >
      <Controller
        name="tipo"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="lgpd-type">O que você quer pedir?</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="lgpd-type"
                ref={field.ref}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? "lgpd-type-error" : undefined}
                className="h-12 w-full rounded-xl px-4 text-base"
              >
                <SelectValue placeholder="Escolha o tipo de solicitação" />
              </SelectTrigger>
              <SelectContent>
                {LGPD_REQUEST_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="lgpd-type-error" errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        name="nome"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="lgpd-name">Nome completo</FieldLabel>
            <Input {...field} id="lgpd-name" autoComplete="name" maxLength={120} aria-invalid={fieldState.invalid} className={INPUT_CLASS} />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        name="cpf"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="lgpd-cpf">CPF do titular</FieldLabel>
            <Input
              {...field}
              id="lgpd-cpf"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              onChange={(event) => field.onChange(formatCpfInput(event.target.value))}
              aria-invalid={fieldState.invalid}
              className={INPUT_CLASS}
            />
            <FieldDescription>Usado só para encontrar seus dados.</FieldDescription>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="lgpd-email">E-mail</FieldLabel>
              <Input {...field} id="lgpd-email" type="email" autoComplete="email" aria-invalid={fieldState.invalid} className={INPUT_CLASS} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="whatsapp"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="lgpd-whatsapp">WhatsApp</FieldLabel>
              <Input
                {...field}
                id="lgpd-whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(85) 90000-0000"
                onChange={(event) => field.onChange(formatPhoneInput(event.target.value))}
                aria-invalid={fieldState.invalid}
                className={INPUT_CLASS}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
      <p className="-mt-3 text-sm text-muted-foreground">Informe pelo menos um contato: é por ele que enviaremos a resposta.</p>

      <Controller
        name="mensagem"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="lgpd-message">Mensagem (opcional)</FieldLabel>
            <Textarea {...field} id="lgpd-message" rows={4} maxLength={LGPD_MESSAGE_MAX_LENGTH} aria-invalid={fieldState.invalid} className="rounded-xl text-base md:text-base" />
            <FieldDescription>Conte o que precisa (ex.: qual dado corrigir). Não envie documentos por aqui.</FieldDescription>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <LgpdConsentField control={form.control} />

      {submitError && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {submitError}
        </p>
      )}

      <Button type="submit" variant="cta" size="xl" disabled={mutation.isPending} className="w-full normal-case tracking-normal sm:w-auto sm:self-start">
        <Send aria-hidden="true" />
        {mutation.isPending ? "Enviando..." : "Enviar solicitação"}
      </Button>
    </form>
  )
}
