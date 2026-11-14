import { Skeleton } from "@/components/ui/skeleton"

/** Mesmo tamanho do `AdminPageHero`, enquanto o título depende de dados (ex.: nome do admin). */
export function AdminPageHeroSkeleton() {
  return (
    <div aria-hidden="true" className="border-t border-white/10 bg-brand-navy-deep">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8">
        <Skeleton className="h-3 w-40 bg-white/15" />
        <Skeleton className="h-9 w-72 max-w-full bg-white/15" />
        <Skeleton className="h-4 w-96 max-w-full bg-white/10" />
      </div>
    </div>
  )
}
