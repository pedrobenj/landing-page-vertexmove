"use client"

import { useMutation } from "@tanstack/react-query"
import { MailCheck, Mail } from "lucide-react"

import { requestAccessLinkAction } from "@/app/actions/registration-access"
import { Button } from "@/components/ui/button"
import type { LookupInput } from "@/lib/validations/lookup.schema"

const NETWORK_ERROR = "Verifique sua conexão e tente de novo."

interface AccessLinkRequestProps {
  /** A mesma entrada da consulta feita (CPF ou WhatsApp). */
  lookup: LookupInput
}

/**
 * "Receber link de acesso por e-mail": aparece depois de qualquer resultado da consulta, inclusive o
 * vazio, e a resposta é sempre a mesma (não revela se há inscrição ou e-mail cadastrado).
 */
export function AccessLinkRequest({ lookup }: AccessLinkRequestProps) {
  const mutation = useMutation({
    mutationFn: () => requestAccessLinkAction(lookup),
    // O CPF/WhatsApp não fica em cache depois que a tela desmonta.
    gcTime: 0,
  })

  const response = mutation.data
  const sentMessage = response?.status === 202 ? response.title : null
  const error = mutation.isError ? NETWORK_ERROR : response && response.status !== 202 ? (response.error ?? NETWORK_ERROR) : null

  return (
    <section aria-labelledby="access-link-title" className="flex flex-col gap-4 rounded-2xl border bg-slate-50 p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 id="access-link-title" className="flex items-center gap-2 font-heading text-lg font-black text-brand-navy-deep">
          <Mail aria-hidden="true" className="size-5 shrink-0 text-brand-green-text" />
          Abrir a inscrição neste aparelho
        </h2>
        <p className="text-sm text-muted-foreground">
          Enviamos para o e-mail cadastrado na inscrição um link para ver o status e pagar daqui, sem senha.
        </p>
      </div>

      <div aria-live="polite">
        {sentMessage ? (
          <p role="status" className="flex gap-2 text-sm font-medium text-brand-navy-deep">
            <MailCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-green-text" />
            {sentMessage}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="xl"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
              className="w-full normal-case tracking-normal sm:w-fit"
            >
              <Mail aria-hidden="true" />
              {mutation.isPending ? "Enviando..." : "Receber link de acesso por e-mail"}
            </Button>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
