import Link from "next/link"

import type { NavItem } from "@/types/nav-item.interface"

interface FooterNavLinkProps {
  item: NavItem
}

export function FooterNavLink({ item }: FooterNavLinkProps) {
  return (
    <li>
      <Link href={item.href} className="text-white/80 transition-colors hover:text-brand-green">
        {item.label}
      </Link>
    </li>
  )
}
