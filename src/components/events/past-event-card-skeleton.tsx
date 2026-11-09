import { Skeleton } from "@/components/ui/skeleton"

export function PastEventCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[3/4] rounded-2xl" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-6 w-3/4" />
    </div>
  )
}
