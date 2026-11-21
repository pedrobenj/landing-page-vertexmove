/** `tipo` do produto na API (decisão L2). */
export enum PRODUCT_TYPE {
  SHIRT = "camisa",
  VISOR = "viseira",
  ACCESSORY = "acessorio",
}

export const PRODUCT_TYPE_LABEL: Record<PRODUCT_TYPE, string> = {
  [PRODUCT_TYPE.SHIRT]: "Camisa",
  [PRODUCT_TYPE.VISOR]: "Viseira",
  [PRODUCT_TYPE.ACCESSORY]: "Acessório",
}

/** Seções da loja, na ordem do enum (camisas primeiro). `anchor` também é o valor de `?tipo=`. */
export const PRODUCT_TYPE_SECTION: Record<PRODUCT_TYPE, { title: string; anchor: string }> = {
  [PRODUCT_TYPE.SHIRT]: { title: "Camisas", anchor: "camisas" },
  [PRODUCT_TYPE.VISOR]: { title: "Viseiras", anchor: "viseiras" },
  [PRODUCT_TYPE.ACCESSORY]: { title: "Acessórios", anchor: "acessorios" },
}
