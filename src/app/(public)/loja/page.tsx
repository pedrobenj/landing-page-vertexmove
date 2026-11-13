import { ShoppingCart } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { PageHero, SectionBand } from "@/components/sections"
import { Button } from "@/components/ui/button"

import { StoreCatalog, StoreCatalogSkeleton } from "./components"

export const metadata: Metadata = {
  title: "Loja",
  description: "Camisas e acessórios do Vertex Grupo de Corrida. Pague com Pix e retire presencialmente.",
  alternates: { canonical: "/loja" },
}

export default function StorePage({ searchParams }: PageProps<"/loja">) {
  return (
    <>
      <PageHero
        id="loja-title"
        eyebrow="Vista a subida"
        title="Camisas e acessórios"
        description="Peças oficiais do Vertex para treino e prova. Pague com Pix e retire presencialmente, sem frete."
        actions={
          <Button asChild variant="outline" size="lg" className="w-full rounded-xl sm:w-auto">
            <Link href="/loja/carrinho">
              <ShoppingCart aria-hidden="true" />
              Ver carrinho
            </Link>
          </Button>
        }
      />
      <SectionBand className="border-t-0">
        {/* `?tipo=` é dado da requisição: o catálogo (filtro + produtos) fica atrás do Suspense. */}
        <Suspense fallback={<StoreCatalogSkeleton />}>
          <StoreCatalog searchParams={searchParams} />
        </Suspense>
      </SectionBand>
    </>
  )
}
