import { ShoppingBag } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { SectionBand, SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"

interface StoreBandProps {
  children: ReactNode
}

/** Moldura da seção da loja na home (usada pelo conteúdo e pelo skeleton). */
export function StoreBand({ children }: StoreBandProps) {
  return (
    <SectionBand aria-labelledby="loja-title">
      <SectionHeading
        id="loja-title"
        eyebrow="Loja Vertex"
        title="Vista a subida"
        description="Camisas e acessórios oficiais para treino e prova. Pague com Pix e retire presencialmente, sem frete."
        actions={
          <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
            <Link href="/loja">
              <ShoppingBag aria-hidden="true" />
              Conhecer a loja
            </Link>
          </Button>
        }
      />
      {children}
    </SectionBand>
  )
}
