export type ContactChannelKind = "whatsapp" | "instagram" | "email"

/** Canal de contato exibido em `/contato`. Sem `href` → canal ainda não configurado ("Em breve"). */
export interface ContactChannel {
  kind: ContactChannelKind
  label: string
  value: string
  description: string
  href?: string
  external: boolean
}
