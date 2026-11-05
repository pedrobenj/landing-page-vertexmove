import Link from "next/link"

import { PRODUCT_TYPE_SECTION } from "@/enums/product-type.enum"

export function StoreSectionNav() {
  return (
    <nav aria-label="Seções da loja" className="flex gap-2">
      <Link href={`#${PRODUCT_TYPE_SECTION.SHIRT.anchor}`} className="rounded-full border px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-muted">
        {PRODUCT_TYPE_SECTION.SHIRT.title}
      </Link>
      <Link href={`#${PRODUCT_TYPE_SECTION.MEDAL.anchor}`} className="rounded-full border px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-muted">
        {PRODUCT_TYPE_SECTION.MEDAL.title}
      </Link>
    </nav>
  )
}
