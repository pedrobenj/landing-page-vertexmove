import { Plus } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export function NewEventLink() {
  return (
    <Button asChild>
      <Link href="/admin/eventos/novo">
        <Plus aria-hidden="true" /> Nova corrida
      </Link>
    </Button>
  )
}
