import { Search } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export function LookupLink() {
  return (
    <Button asChild variant="outline" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
      <Link href="/consulta">
        <Search aria-hidden="true" />
        Consultar inscrição
      </Link>
    </Button>
  )
}
