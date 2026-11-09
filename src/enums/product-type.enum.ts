export enum PRODUCT_TYPE {
  SHIRT = "SHIRT",
  MEDAL = "MEDAL",
}

export const PRODUCT_TYPE_LABEL: Record<PRODUCT_TYPE, string> = {
  SHIRT: "Camisa",
  MEDAL: "Medalha",
}

export const PRODUCT_TYPE_SECTION: Record<PRODUCT_TYPE, { title: string; anchor: string }> = {
  SHIRT: { title: "Camisas", anchor: "camisas" },
  MEDAL: { title: "Medalhas", anchor: "medalhas" },
}
