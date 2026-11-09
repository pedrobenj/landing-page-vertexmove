import { ShoppingBag } from "lucide-react"
import Link from "next/link"

import { SectionBand, SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"

export function StoreBandSection() {
  return (
    <SectionBand aria-labelledby="loja-title">
      <SectionHeading
        id="loja-title"
        eyebrow="Leve o Vertex com você"
        title="Loja Vertex"
        description="Produtos oficiais para vestir o movimento."
        className="border-b pb-12"
        actions={
          <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
            <Link href="/loja">
              <ShoppingBag aria-hidden="true" />
              Conhecer a loja
            </Link>
          </Button>
        }
      />
    </SectionBand>
  )
}
