import Link from "next/link"

import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/nav-item.interface"

interface AdminNavLinkProps {
  item: NavItem
  isActive: boolean
}

export function AdminNavLink({ item, isActive }: AdminNavLinkProps) {
  return (
    <li className="shrink-0">
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "block rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 transition-colors hover:bg-white/10 hover:text-brand-green focus-visible:outline-2 focus-visible:outline-brand-green",
          isActive && "bg-white/10 text-brand-green",
        )}
      >
        {item.label}
      </Link>
    </li>
  )
}
