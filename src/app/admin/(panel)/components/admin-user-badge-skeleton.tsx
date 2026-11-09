import { Skeleton } from "@/components/ui/skeleton"

export function AdminUserBadgeSkeleton() {
  return (
    <div className="flex items-center gap-2.5" aria-hidden="true">
      <Skeleton className="size-9 rounded-full bg-white/15" />
      <span className="hidden flex-col gap-1.5 sm:flex">
        <Skeleton className="h-3.5 w-28 bg-white/15" />
        <Skeleton className="h-3 w-16 bg-white/15" />
      </span>
    </div>
  )
}
