import { PRODUCT_TYPE, PRODUCT_TYPE_SECTION } from "@/enums/product-type.enum"

export interface StoreFilterOption {
  label: string
  href: string
  /** `null` = todos os tipos. */
  type: PRODUCT_TYPE | null
}

const PRODUCT_TYPES = Object.values(PRODUCT_TYPE)

/** Filtros da loja ("Todos" + um por tipo), como na referência. O tipo vai em `?tipo=` (ex.: `medalhas`). */
export const STORE_FILTER_OPTIONS: readonly StoreFilterOption[] = [
  { label: "Todos", href: "/loja", type: null },
  ...PRODUCT_TYPES.map((type) => ({
    label: PRODUCT_TYPE_SECTION[type].title,
    href: `/loja?tipo=${PRODUCT_TYPE_SECTION[type].anchor}`,
    type,
  })),
]

/** `?tipo=` da loja → tipo de produto. Ausente ou desconhecido = todos (`null`). */
export function parseStoreFilter(tipo: string | string[] | undefined): PRODUCT_TYPE | null {
  const value = Array.isArray(tipo) ? tipo[0] : tipo
  return PRODUCT_TYPES.find((type) => PRODUCT_TYPE_SECTION[type].anchor === value) ?? null
}
