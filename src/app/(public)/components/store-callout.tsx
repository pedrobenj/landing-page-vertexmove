import { ShoppingBag } from "lucide-react"
import Link from "next/link"

import { Chevron } from "@/components/brand"
import { Button } from "@/components/ui/button"

/** Bloco da loja na home, ao lado das provas parceiras. */
export function StoreCallout() {
  return (
    <section
      aria-labelledby="loja-title"
      className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-brand-green p-6 text-brand-navy-deep sm:p-8"
    >
      <Chevron className="pointer-events-none absolute -right-10 -bottom-6 w-56 text-brand-navy-deep opacity-10" />
      <div className="relative flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em]">Loja Vertex</p>
        <h2 id="loja-title" className="font-heading text-3xl font-black sm:text-4xl">
          Vista a subida
        </h2>
        <p className="text-brand-navy-deep/85">Camisas e acessórios oficiais para treino e prova. Pix e retirada presencial.</p>
      </div>
      <Button asChild size="xl" className="relative w-full bg-brand-navy-deep normal-case tracking-normal text-white hover:bg-brand-navy sm:w-fit">
        <Link href="/loja">
          <ShoppingBag aria-hidden="true" />
          Conhecer a loja
        </Link>
      </Button>
    </section>
  )
}
