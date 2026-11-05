import Link from "next/link"

import { Button } from "@/components/ui/button"

export function FinalCtaSection() {
  return (
    <section className="bg-brand-green">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center">
        <h2 className="text-2xl font-extrabold uppercase text-brand-navy sm:text-3xl">Bora correr com o Vertex?</h2>
        <Button asChild size="xl">
          <Link href="#corridas">Ver corridas abertas</Link>
        </Button>
      </div>
    </section>
  )
}
