export enum PRODUCT_TYPE {
  SHIRT = "SHIRT",
  VISOR = "VISOR",
  ACCESSORY = "ACCESSORY",
}

export const PRODUCT_TYPE_LABEL: Record<PRODUCT_TYPE, string> = {
  SHIRT: "Camisa",
  VISOR: "Viseira",
  ACCESSORY: "Acessório",
}

/** Seções da loja, na ordem do enum (camisas primeiro). `anchor` também é o valor de `?tipo=`. */
export const PRODUCT_TYPE_SECTION: Record<PRODUCT_TYPE, { title: string; anchor: string }> = {
  SHIRT: { title: "Camisas", anchor: "camisas" },
  VISOR: { title: "Viseiras", anchor: "viseiras" },
  ACCESSORY: { title: "Acessórios", anchor: "acessorios" },
}
