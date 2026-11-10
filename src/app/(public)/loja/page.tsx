import { ShoppingCart } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { SectionBand, SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"

import { StoreCatalog, StoreCatalogSkeleton } from "./components"

export const metadata: Metadata = {
  title: "Loja",
  description: "Camisas e acessórios do Vertex Grupo de Corrida. Pague com Pix e retire presencialmente.",
  alternates: { canonical: "/loja" },
}

export default function StorePage({ searchParams }: PageProps<"/loja">) {
  return (
    <SectionBand aria-labelledby="loja-title" className="border-t-0">
      <SectionHeading
        as="h1"
        id="loja-title"
        eyebrow="Loja Vertex"
        title="Camisas e acessórios"
        description="Vista o movimento: pague com Pix e retire presencialmente — sem frete."
        actions={
          <Button asChild variant="outline" size="lg" className="w-full rounded-xl sm:w-auto">
            <Link href="/loja/carrinho">
              <ShoppingCart aria-hidden="true" />
              Ver carrinho
            </Link>
          </Button>
        }
      />
      {/* `?tipo=` é dado da requisição: o catálogo (filtro + produtos) fica atrás do Suspense. */}
      <Suspense fallback={<StoreCatalogSkeleton />}>
        <StoreCatalog searchParams={searchParams} />
      </Suspense>
    </SectionBand>
  )
}
