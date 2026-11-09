"use client"

import { ServerError } from "@/components/feedback"
import { Button } from "@/components/ui/button"

interface AdminListErrorProps {
  title: string
  /** Busca a página atual de novo. */
  onRetry: () => void
  /** Volta à primeira página; só aparece quando informado (lista fora da primeira página). */
  onReset?: () => void
  isRetrying?: boolean
}

/** Erro de uma lista paginada do admin, com saída: tentar de novo e, fora da 1ª página, voltar ao início. */
export function AdminListError({ title, onRetry, onReset, isRetrying = false }: AdminListErrorProps) {
  return (
    <ServerError
      title={title}
      message="Verifique sua conexão e tente de novo. Se o erro continuar, a API pode estar fora do ar."
      action={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onRetry} disabled={isRetrying}>
            {isRetrying ? "Tentando…" : "Tentar de novo"}
          </Button>
          {onReset && (
            <Button type="button" variant="ghost" onClick={onReset}>
              Voltar à primeira página
            </Button>
          )}
        </div>
      }
    />
  )
}
