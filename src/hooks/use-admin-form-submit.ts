"use client"

import { useRouter } from "next/navigation"
import { type BaseSyntheticEvent, useRef, useTransition } from "react"
import type { FieldValues, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import { isFormField } from "@/lib/utils/is-form-field"
import type { HttpResponse } from "@/types/http-response.interface"

interface UseAdminFormSubmitOptions<TValues extends FieldValues, TData> {
  /** Chama a server action com os valores crus do formulário (o servidor valida de novo). */
  submit: (values: TValues) => Promise<HttpResponse<TData>>
  /** `defaultValues` do formulário: decide se o campo de um erro da API existe no form. */
  defaults: TValues
  errorTitle: string
  /** Depois do sucesso (ex.: fechar o diálogo). Em seguida a página é atualizada (`router.refresh()`). */
  onSuccess?: (data: TData) => void
}

/**
 * Envio dos formulários do admin que salvam via server action e recarregam a página (Server Components):
 * trava contra duplo envio, `setError` no campo apontado pela API (422/409) e toasts.
 */
export function useAdminFormSubmit<TValues extends FieldValues, TOutput, TData>(
  form: UseFormReturn<TValues, unknown, TOutput>,
  { submit, defaults, errorTitle, onSuccess }: UseAdminFormSubmitOptions<TValues, TData>,
) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  // Trava síncrona contra duplo envio (o estado do React só atualiza no próximo render).
  const submittingRef = useRef(false)

  function onSubmit() {
    if (submittingRef.current) return
    submittingRef.current = true

    startTransition(async () => {
      try {
        let response: HttpResponse<TData>
        try {
          response = await submit(form.getValues())
        } catch {
          toast.error(`${errorTitle}. Verifique sua conexão e tente de novo.`)
          return
        }

        if (response.data === undefined) {
          if (response.field && isFormField(defaults, response.field)) {
            form.setError(response.field, { message: response.error }, { shouldFocus: true })
          }
          toast.error(response.title ?? errorTitle, { description: response.error })
          return
        }

        toast.success(response.title ?? "Salvo")
        onSuccess?.(response.data)
        router.refresh()
      } finally {
        submittingRef.current = false
      }
    })
  }

  return {
    // Wrapper chamado só no evento (o handleSubmit não roda no render: o callback usa a ref).
    onSubmit: (event?: BaseSyntheticEvent) => form.handleSubmit(onSubmit)(event),
    isBusy: form.formState.isSubmitting || isPending,
  }
}
