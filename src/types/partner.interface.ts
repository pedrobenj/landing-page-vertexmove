/** Parceiro/apoiador exibido na home e em `/parceiros`. Sem logo → a UI mostra um monograma com o nome. */
export interface Partner {
  nome: string
  logoUrl: string | null
  url?: string
}
