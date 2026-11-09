export interface AdminEventSection {
  label: string
  href: string
  /** Página ainda sem endpoint no backend: aparece como "Em breve", sem link. */
  comingSoon?: boolean
}

/** Páginas de cadastro ligadas a uma corrida no admin. */
export function getAdminEventSections(eventId: number): AdminEventSection[] {
  const base = `/admin/eventos/${eventId}`
  return [
    { label: "Distâncias e lotes", href: `${base}/distancias` },
    { label: "Kits", href: `${base}/kits` },
    { label: "Documentos", href: `${base}/documentos` },
    // §15: lista/exportação de inscritos depende do backend.
    { label: "Inscrições", href: `${base}/inscricoes`, comingSoon: true },
  ]
}
