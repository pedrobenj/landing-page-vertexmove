import { AlertTriangle } from "lucide-react"
import type { ReactNode } from "react"

interface ServerErrorProps {
  title?: string
  message?: string
  /** Saída para o usuário (ex.: "Tentar de novo"). */
  action?: ReactNode
}

export function ServerError({
  title = "Não foi possível carregar",
  message = "Tente novamente em instantes. Se o problema continuar, fale com a gente no WhatsApp.",
  action,
}: ServerErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
      <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
      <p className="font-heading font-bold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  )
}
