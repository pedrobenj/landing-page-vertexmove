import Link from "next/link"

import { VertexLogo } from "@/components/brand"
import { Button } from "@/components/ui/button"

import { CartButton } from "./cart-button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Vertex Grupo de Corrida — início">
          <VertexLogo variant="symbol" className="w-9 sm:hidden" priority />
          <VertexLogo className="hidden w-36 sm:block" priority />
        </Link>

        <nav aria-label="Principal" className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="font-semibold text-brand-navy">
            <Link href="/loja">Loja</Link>
          </Button>
          <CartButton />
          <Button asChild variant="ghost" size="sm" className="hidden text-muted-foreground sm:inline-flex">
            <Link href="/admin">Área do admin</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/consulta">Minha inscrição</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
