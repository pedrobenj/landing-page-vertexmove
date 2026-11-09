export interface AdminShortcut {
  label: string
  description: string
  href: string
}

/** Atalhos do dashboard; "Nova corrida" só para quem pode cadastrar (matriz a confirmar, §16). */
export function getAdminShortcuts(canManage: boolean): AdminShortcut[] {
  return [
    ...(canManage ? [{ label: "Nova corrida", description: "Cadastrar como rascunho", href: "/admin/eventos/novo" }] : []),
    { label: "Corridas", description: "Status, distâncias, kits e documentos", href: "/admin/eventos" },
    { label: "Tamanhos de camisa", description: "Catálogo usado pelos kits", href: "/admin/tamanhos-camisa" },
    { label: "Auditoria", description: "Quem fez o quê, e quando", href: "/admin/auditoria" },
  ]
}

/** Métricas do dashboard: dependem de endpoints do backend ainda pendentes (§15). */
export const ADMIN_DASHBOARD_METRICS: readonly string[] = [
  "Inscrições",
  "Inscrições confirmadas",
  "Valor arrecadado",
  "Vagas restantes",
]
