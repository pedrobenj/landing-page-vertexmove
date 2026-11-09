import { Skeleton } from "@/components/ui/skeleton"

/** Mesmo layout do wizard (indicador + etapa 1) enquanto o rascunho é lido do sessionStorage. */
export function RegistrationWizardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando formulário" className="flex flex-col gap-8">
      <div className="flex justify-between px-[8%]">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="size-9 rounded-full" />
        ))}
      </div>
      <div className="flex flex-col gap-6 rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-full max-w-md" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-xl sm:ml-auto sm:w-40" />
      </div>
    </div>
  )
}
