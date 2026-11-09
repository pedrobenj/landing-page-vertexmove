import type { ShirtSize } from "@/types/api/shirt-size.interface"

interface ShirtSizeListItemProps {
  size: ShirtSize
}

export function ShirtSizeListItem({ size }: ShirtSizeListItemProps) {
  return (
    <li
      title={size.descricao ?? undefined}
      className="flex h-10 min-w-12 items-center justify-center rounded-xl border bg-card px-3 font-heading text-sm font-bold text-brand-navy-deep"
    >
      {size.codigo}
    </li>
  )
}
