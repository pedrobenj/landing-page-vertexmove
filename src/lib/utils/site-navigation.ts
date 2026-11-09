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

/**
 * Link discreto, sempre por último. Aponta para o painel (e não para o login): sem sessão o `proxy.ts`
 * manda ao login; com sessão, o admin cai direto no painel.
 */
export const ADMIN_NAV_ITEM: NavItem = { label: "Área administrativa", href: "/admin" }

/** Menu do painel do admin (CLAUDE.md §5). */
export const ADMIN_PANEL_NAV_ITEMS: readonly NavItem[] = [
  { label: "Eventos", href: "/admin/eventos" },
  { label: "Tamanhos de camisa", href: "/admin/tamanhos-camisa" },
  { label: "Auditoria", href: "/admin/auditoria" },
  { label: "Loja", href: "/admin/loja/produtos" },
]
