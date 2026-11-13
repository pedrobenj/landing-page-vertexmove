import { Store } from "lucide-react"

import { EmptyState } from "@/components/feedback"
import { ArrowLink } from "@/components/sections/arrow-link"
import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import { getApiErrorMessage } from "@/lib/utils/api-errors"

interface StoreUnavailableProps {
  /** No admin não há CTA para as corridas. */
  context?: "public" | "admin"
}

/** Estado da loja enquanto o backend não a expõe (`503 LOJA_INDISPONIVEL`). */
export function StoreUnavailable({ context = "public" }: StoreUnavailableProps) {
  const isAdmin = context === "admin"
  return (
    <EmptyState
      icon={Store}
      title={getApiErrorMessage(API_ERROR_CODE.STORE_UNAVAILABLE)}
      description={
        isAdmin
          ? "O cadastro de produtos volta a funcionar quando a API da loja estiver no ar."
          : "Camisas, viseiras e acessórios do Vertex chegam aqui em breve. Enquanto isso, garanta sua vaga."
      }
      action={
        isAdmin ? undefined : (
          <ArrowLink href="/#corridas" className="text-brand-green-text">
            Ver os próximos topos
          </ArrowLink>
        )
      }
    />
  )
}
