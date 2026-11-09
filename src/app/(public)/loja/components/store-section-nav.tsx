import type { PRODUCT_TYPE } from "@/enums/product-type.enum"
import { STORE_FILTER_OPTIONS } from "@/lib/utils"

import { StoreSectionNavItem } from "./store-section-nav-item"

interface StoreSectionNavProps {
  /** `null` = "Todos". */
  activeType: PRODUCT_TYPE | null
}

/** Filtro por categoria ("Todos" + tipos), via `?tipo=` (ex.: `/loja?tipo=medalhas`). */
export function StoreSectionNav({ activeType }: StoreSectionNavProps) {
  return (
    <nav aria-label="Categorias da loja">
      <ul className="flex flex-wrap gap-2">
        {STORE_FILTER_OPTIONS.map((option) => (
          <StoreSectionNavItem key={option.href} option={option} isActive={option.type === activeType} />
        ))}
      </ul>
    </nav>
  )
}
