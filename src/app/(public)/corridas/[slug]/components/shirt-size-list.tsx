import { Shirt } from "lucide-react"

import type { ShirtSize } from "@/types/api/shirt-size.interface"

import { ShirtSizeListItem } from "./shirt-size-list-item"

interface ShirtSizeListProps {
  sizes: ShirtSize[] | undefined
}

/** Tamanhos de camisa disponíveis no evento. Não renderiza nada se a API não informar. */
export function ShirtSizeList({ sizes }: ShirtSizeListProps) {
  const activeSizes = (sizes ?? []).filter((size) => size.ativo)
  if (activeSizes.length === 0) return null

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <p className="flex items-center gap-2 text-sm font-bold text-brand-navy-deep">
        <Shirt aria-hidden="true" className="size-5 text-brand-green-text" />
        Tamanhos de camisa
      </p>
      <ul aria-label="Tamanhos de camisa" className="flex flex-wrap gap-2">
        {activeSizes.map((size) => (
          <ShirtSizeListItem key={size.id} size={size} />
        ))}
      </ul>
    </div>
  )
}
