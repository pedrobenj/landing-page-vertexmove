import { Skeleton } from "@/components/ui/skeleton"

import { HeroFrame } from "./hero-frame"

/** Mesmo layout do hero enquanto a lista de corridas carrega. */
export function NextRaceHeroSkeleton() {
  return (
    <HeroFrame>
      <div role="status" aria-busy="true" aria-label="Carregando a próxima corrida" className="flex flex-col gap-6">
        <Skeleton className="h-7 w-36 rounded-full bg-white/10" />
        <h1 id="hero-title" className="sr-only">
          Próxima corrida do Vertex
        </h1>
        <Skeleton className="h-14 w-full max-w-lg bg-white/10 sm:h-20" />
        <Skeleton className="h-6 w-64 bg-white/10" />
        <Skeleton className="h-12 w-full bg-white/10 sm:w-56" />
      </div>
      <Skeleton className="mx-auto aspect-[4/3] w-full max-w-md -rotate-3 rounded-3xl bg-white/10 lg:max-w-none" />
    </HeroFrame>
  )
}
