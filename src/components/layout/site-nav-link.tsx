"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/nav-item.interface"

interface SiteNavLinkProps {
  item: NavItem
  subtle?: boolean
}

/** Item do menu lateral. Fecha o painel ao clicar (inclusive em âncoras como /#corridas). */
export function SiteNavLink({ item, subtle = false }: SiteNavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === item.href

  return (
    <li>
      <SheetClose asChild>
        <Link
          href={item.href}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "block rounded-lg px-3 py-2.5 transition-colors hover:bg-white/10 hover:text-brand-green focus-visible:outline-2 focus-visible:outline-brand-green",
            subtle
              ? "text-sm text-white/70"
              : "font-heading text-2xl font-extrabold text-white",
            isActive && "text-brand-green",
          )}
        >
          {item.label}
        </Link>
      </SheetClose>
    </li>
  )
}
