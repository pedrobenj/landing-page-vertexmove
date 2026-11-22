export interface AdminEventSection {
  label: string
  href: string
}

/** Páginas de cadastro ligadas a uma corrida no admin. */
export function getAdminEventSections(eventId: number): AdminEventSection[] {
  const base = `/admin/eventos/${eventId}`
  return [
    { label: "Distâncias e lotes", href: `${base}/distancias` },
    { label: "Kits", href: `${base}/kits` },
    { label: "Documentos", href: `${base}/documentos` },
    { label: "Inscrições", href: `${base}/inscricoes` },
  ]
}
