/** Seção da política de privacidade (`/privacidade`). */
export interface PrivacySection {
  id: string
  title: string
  paragraphs: string[]
  items?: string[]
  /** Link de ação ao fim da seção (ex.: formulário de solicitação do titular). */
  action?: { label: string; href: string }
  /** Parágrafos depois da lista (e antes da ação). */
  closing?: string[]
}
