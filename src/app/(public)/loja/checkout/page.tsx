import type { Metadata } from "next"

import { SectionBand, SectionHeading } from "@/components/sections"
import { StoreUnavailable } from "@/components/store"
import { isStoreEnabled } from "@/server/api/endpoints/store"

import { CheckoutView } from "./components"

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } }

export default function CheckoutPage() {
  return (
    <SectionBand aria-labelledby="checkout-title" className="border-t-0" containerClassName="gap-8">
      <SectionHeading
        as="h1"
        id="checkout-title"
        eyebrow="Loja Vertex"
        title="Finalizar compra"
        description="Informe seus dados para reservar os itens. O estoque fica reservado por 30 minutos."
      />
      {/* Sem backend da loja: avisa já, mesmo com o carrinho vazio (sem itens o client não consulta nada). */}
      {isStoreEnabled() ? <CheckoutView /> : <StoreUnavailable />}
    </SectionBand>
  )
}
