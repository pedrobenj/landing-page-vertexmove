import type { ORDER_STATUS } from "@/enums/order-status.enum"

import type { ApiCartItem } from "./store-cart.interface"

/** Corpo de `POST /loja/pedidos`. */
export interface ApiCreateStoreOrder {
  nomeCompleto: string
  cpf: string
  whatsapp: string
  email: string
  aceitePrivacidade: true
  itens: ApiCartItem[]
}

/** `201` de `POST /loja/pedidos`. O `accessToken` fica só no servidor do Next (cookie HttpOnly). */
export interface ApiCreatedStoreOrder {
  codigo: string
  accessToken: string
  expiraEm: string
}

export interface ApiStoreOrderItem {
  produtoNome: string
  varianteRotulo: string
  quantidade: number
  precoUnitarioCentavos: number
}

/** `GET /loja/pedidos/:codigo`: resumo público, sem CPF, telefone e e-mail. */
export interface ApiStoreOrderSummary {
  codigo: string
  status: ORDER_STATUS
  valorTotalCentavos: number
  primeiroNome: string
  criadoEm: string
  expiraEm: string | null
  itens: ApiStoreOrderItem[]
  retiradas: string[]
}

/** `POST /loja/pedidos/:codigo/pagamentos`: link do Checkout Pro. */
export interface ApiStoreCheckout {
  checkoutUrl: string | null
}

/** Item de `GET /admin/loja/pedidos` (`CursorPage`). */
export interface ApiAdminStoreOrder {
  codigo: string
  status: ORDER_STATUS
  nomeCompleto: string
  valorTotalCentavos: number
  quantidadeItens: number
  criadoEm: string
  expiraEm: string | null
  pagoEm: string | null
}

/** `GET /admin/loja/pedidos/:codigo`: com contato do comprador (CPF mascarado). */
export interface ApiAdminStoreOrderDetails extends ApiAdminStoreOrder {
  whatsapp: string
  email: string
  cpfMascarado: string
  retiradoEm: string | null
  itens: ApiStoreOrderItem[]
  retiradas: string[]
}
