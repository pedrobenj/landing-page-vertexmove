import { SearchX } from "lucide-react"
import Link from "next/link"

import { EmptyState, ServerError } from "@/components/feedback"
import { Button } from "@/components/ui/button"
import type { RegistrationLookupItem } from "@/types/api/registration.interface"

import { LookupResultItem } from "./lookup-result-item"
import { LookupResultsSkeleton } from "./lookup-results-skeleton"

interface LookupResultsProps {
  isPending: boolean
  error: string | null
  /** `null` = nenhuma consulta feita ainda. */
  items: RegistrationLookupItem[] | null
}

/** Resultado da consulta com os 4 estados (carregando, erro, vazio, sucesso). */
export function LookupResults({ isPending, error, items }: LookupResultsProps) {
  if (isPending) return <LookupResultsSkeleton />
  if (error) return <ServerError title="Não foi possível consultar" message={error} />
  if (items === null) return null

  if (items.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="Nenhuma inscrição encontrada para os dados informados."
        description="Confira se digitou o mesmo CPF ou WhatsApp usado na inscrição."
        action={
          <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
            <Link href="/#corridas">Ver corridas</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-black text-brand-navy-deep">
        {items.length === 1 ? "1 inscrição encontrada" : `${items.length} inscrições encontradas`}
      </h2>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <LookupResultItem key={`${item.evento}-${item.distancia}-${item.inscritoEm}`} item={item} />
        ))}
      </ul>
    </div>
  )
}
