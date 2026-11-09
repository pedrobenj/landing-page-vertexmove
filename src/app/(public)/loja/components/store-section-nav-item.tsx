import Link from "next/link"

import { cn, type StoreFilterOption } from "@/lib/utils"

interface StoreSectionNavItemProps {
  option: StoreFilterOption
  isActive: boolean
}

export function StoreSectionNavItem({ option, isActive }: StoreSectionNavItemProps) {
  return (
    <li>
      <Link
        href={option.href}
        scroll={false}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
          isActive
            ? "border-brand-navy-deep bg-brand-navy-deep text-white"
            : "border-border bg-background text-brand-navy-deep hover:bg-slate-50",
        )}
      >
        {option.label}
      </Link>
    </li>
  )
}
