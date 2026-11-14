import { CalendarPlus, Flag, type LucideIcon, ScrollText, Shirt } from "lucide-react"

export interface AdminShortcut {
  label: string
  description: string
  href: string
  icon: LucideIcon
}

/** Atalhos do dashboard; "Nova corrida" só para quem pode cadastrar (matriz a confirmar, §16). */
export function getAdminShortcuts(canManage: boolean): AdminShortcut[] {
  return [
    ...(canManage
      ? [{ label: "Nova corrida", description: "Cadastrar como rascunho", href: "/admin/eventos/novo", icon: CalendarPlus }]
      : []),
    { label: "Corridas", description: "Status, distâncias, kits e documentos", href: "/admin/eventos", icon: Flag },
    { label: "Tamanhos de camisa", description: "Catálogo usado pelos kits", href: "/admin/tamanhos-camisa", icon: Shirt },
    { label: "Auditoria", description: "Quem fez o quê, e quando", href: "/admin/auditoria", icon: ScrollText },
  ]
}
