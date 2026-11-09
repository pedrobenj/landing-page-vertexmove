import { Package } from "lucide-react"

import { EmptyState } from "@/components/feedback"
import type { PublicKit } from "@/types/api/public-event-detail.interface"

import { KitListItem } from "./kit-list-item"

interface KitListProps {
  kits: PublicKit[] | undefined
}

export function KitList({ kits }: KitListProps) {
  if (!kits || kits.length === 0) {
    return <EmptyState icon={Package} title="Kits em breve." description="Os detalhes do kit serão divulgados em breve." />
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {kits.map((kit) => (
        <KitListItem key={kit.id} kit={kit} />
      ))}
    </ul>
  )
}
