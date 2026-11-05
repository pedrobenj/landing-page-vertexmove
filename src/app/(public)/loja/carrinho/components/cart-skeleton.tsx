import { Skeleton } from "@/components/ui/skeleton"

export function CartSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando carrinho" className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-44 w-full rounded-xl" />
    </div>
  )
}
