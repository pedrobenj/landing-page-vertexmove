import { Skeleton } from "@/components/ui/skeleton"

/** Mesmo layout do painel: card de status + resumo. */
export function RegistrationPaymentSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando a inscrição" className="flex flex-col gap-6">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}
