import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Botão de menu exibido no prerender enquanto o `SiteNavSheet` (que lê o pathname) não resolve —
 * necessário nas rotas com parâmetro dinâmico, como /corridas/[slug].
 */
export function SiteNavSheetFallback() {
  return (
    <Button variant="ghost" size="icon-lg" aria-label="Abrir menu" disabled className="size-11 text-white disabled:opacity-100">
      <Menu className="size-6" aria-hidden="true" />
    </Button>
  )
}
