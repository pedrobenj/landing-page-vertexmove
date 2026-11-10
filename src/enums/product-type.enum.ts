export enum PRODUCT_TYPE {
  SHIRT = "SHIRT",
}

export const PRODUCT_TYPE_LABEL: Record<PRODUCT_TYPE, string> = {
  SHIRT: "Camisa",
}

export const PRODUCT_TYPE_SECTION: Record<PRODUCT_TYPE, { title: string; anchor: string }> = {
  SHIRT: { title: "Camisas", anchor: "camisas" },
}
