import type { Metadata } from "next"

import { SectionBand, SectionHeading } from "@/components/sections"
import { StoreUnavailable } from "@/components/store"
import { isStoreEnabled } from "@/server/api/endpoints/store"

import { CartView } from "./components"

export const metadata: Metadata = { title: "Carrinho", robots: { index: false } }

export default function CartPage() {
  return (
    <SectionBand aria-labelledby="carrinho-title" className="border-t-0" containerClassName="gap-8">
      <SectionHeading
        as="h1"
        id="carrinho-title"
        eyebrow="Loja Vertex"
        title="Carrinho"
        description="Confira os itens antes de finalizar. Pagamento via Pix e retirada presencial."
      />
      {/* Sem backend da loja: avisa já, mesmo com o carrinho vazio (sem itens o client não consulta nada). */}
      {isStoreEnabled() ? <CartView /> : <StoreUnavailable />}
    </SectionBand>
  )
}
