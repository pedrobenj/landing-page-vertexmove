"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { IdCard, MessageCircle, Search } from "lucide-react"
import { useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { lookupRegistrationsAction } from "@/app/actions/registrations"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup } from "@/components/ui/radio-group"
import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { formatCpfInput, formatPhoneInput, queryKeys } from "@/lib/utils"
import { lookupSchema, type LookupData, type LookupInput, type LookupType } from "@/lib/validations/lookup.schema"

import { LookupResults } from "./lookup-results"
import { LookupTypeOption } from "./lookup-type-option"

const FIELD_COPY: Record<LookupType, { label: string; placeholder: string; inputMode: "numeric" | "tel" }> = {
  whatsapp: { label: "WhatsApp usado na inscrição", placeholder: "(85) 90000-0000", inputMode: "tel" },
  cpf: { label: "CPF usado na inscrição", placeholder: "000.000.000-00", inputMode: "numeric" },
}

const NETWORK_ERROR = "Verifique sua conexão e tente de novo."

/**
 * Consulta sem login. É um `POST` (server action) via `useMutation` — CPF/WhatsApp nunca entram em
 * query keys, URLs ou storage; o resultado fica só no estado desta tela.
 */
export function LookupForm() {
  const form = useForm<LookupInput, unknown, LookupData>({
    resolver: zodResolver(lookupSchema),
    defaultValues: { tipo: "whatsapp", valor: "" },
  })
  const tipo = useWatch({ control: form.control, name: "tipo" })
  const copy = FIELD_COPY[tipo]

  const mutation = useMutation({
    mutationKey: queryKeys.registrations.lookup(),
    mutationFn: lookupRegistrationsAction,
    // O CPF/WhatsApp fica em `variables`: sem cache depois que a tela desmonta.
    gcTime: 0,
    onSuccess: (response) => {
      if (response.status === 422 && response.code === API_ERROR_CODE.INVALID_DATA) {
        form.setError("valor", { type: "server", message: response.error }, { shouldFocus: true })
      }
    },
  })

  const { items, error } = useMemo(() => {
    if (mutation.isError) return { items: null, error: NETWORK_ERROR }
    const response = mutation.data
    if (!response) return { items: null, error: null }
    if (response.status === 200) return { items: response.data?.items ?? [], error: null }
    // 422 vira erro no campo (onSuccess); o resto (rate limit, API fora) aparece como erro da consulta.
    if (response.status === 422) return { items: null, error: null }
    return { items: null, error: response.error ?? NETWORK_ERROR }
  }, [mutation.isError, mutation.data])

  function handleTypeChange(value: string, onChange: (value: LookupType) => void) {
    onChange(value as LookupType)
    form.setValue("valor", "")
    form.clearErrors("valor")
    mutation.reset()
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={(formEvent) => form.handleSubmit((data) => mutation.mutate(data))(formEvent)}
        noValidate
        aria-label="Consultar inscrição"
        className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-8"
      >
        <Controller
          name="tipo"
          control={form.control}
          render={({ field }) => (
            <RadioGroup
              ref={field.ref}
              name={field.name}
              value={field.value}
              onValueChange={(value) => handleTypeChange(value, field.onChange)}
              aria-label="Consultar por"
              className="flex gap-1 rounded-xl bg-slate-100 p-1"
            >
              <LookupTypeOption value="whatsapp" label="WhatsApp" icon={MessageCircle} />
              <LookupTypeOption value="cpf" label="CPF" icon={IdCard} />
            </RadioGroup>
          )}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <Controller
            name="valor"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor="lookup-value">{copy.label}</FieldLabel>
                <Input
                  {...field}
                  id="lookup-value"
                  type={tipo === "whatsapp" ? "tel" : "text"}
                  inputMode={copy.inputMode}
                  autoComplete={tipo === "whatsapp" ? "tel-national" : "off"}
                  placeholder={copy.placeholder}
                  onChange={(changeEvent) =>
                    field.onChange(tipo === "cpf" ? formatCpfInput(changeEvent.target.value) : formatPhoneInput(changeEvent.target.value))
                  }
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? "lookup-value-error" : undefined}
                  className="h-12 rounded-xl px-4 text-base md:text-base"
                />
                <FieldError id="lookup-value-error" errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Button
            type="submit"
            variant="cta"
            size="xl"
            disabled={mutation.isPending}
            className="w-full normal-case tracking-normal sm:mt-[1.625rem] sm:w-auto"
          >
            <Search aria-hidden="true" />
            {mutation.isPending ? "Consultando..." : "Consultar"}
          </Button>
        </div>
      </form>

      <div aria-live="polite">
        <LookupResults isPending={mutation.isPending} error={error} items={items} />
      </div>
    </div>
  )
}
