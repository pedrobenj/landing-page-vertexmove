import type { NavItem } from "@/types/nav-item.interface"

/** Menu principal (header e rodapé), na ordem da referência — CLAUDE.md §2. */
export const SITE_NAV_ITEMS: readonly NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Corridas", href: "/#corridas" },
  { label: "Loja", href: "/loja" },
  { label: "Corridas Parceiras", href: "/corridas-parceiras" },
  { label: "Conheça o Vertex", href: "/sobre" },
  { label: "Parceiros", href: "/parceiros" },
  { label: "Contato", href: "/contato" },
]

export const CONSULTATION_NAV_ITEM: NavItem = { label: "Consultar inscrição", href: "/consulta" }

/** Link discreto, sempre por último. */
export const ADMIN_NAV_ITEM: NavItem = { label: "Área administrativa", href: "/admin/login" }
