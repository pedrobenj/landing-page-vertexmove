/** Ações do admin sobre o pedido (`POST /admin/loja/pedidos/:codigo/<acao>`, 204). */
export enum STORE_ORDER_ACTION {
  READY = "pronto",
  PICKED_UP = "retirado",
  CANCEL = "cancelar",
}
