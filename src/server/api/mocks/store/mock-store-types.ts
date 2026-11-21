// Estado interno do mock da loja, no formato da API (chaves em português, ids numéricos em string).

import type { ORDER_STATUS } from "@/enums/order-status.enum"
import type { ApiStoreOrderItem } from "@/types/api/store-order.interface"
import type { ApiAdminStoreProduct, ApiStoreVariant } from "@/types/api/store-product.interface"

/** Variante salva nunca é apagada (pode estar em pedido): sai do formulário → `ativo: false`. */
export interface MockStoreVariant extends ApiStoreVariant {
  ativo?: boolean
}

export interface MockStoreProduct extends Omit<ApiAdminStoreProduct, "variantes"> {
  variantes: MockStoreVariant[]
}

export interface MockStoreOrderItem extends ApiStoreOrderItem {
  varianteId: string
}

export interface MockStoreOrder {
  codigo: string
  status: ORDER_STATUS
  nomeCompleto: string
  cpf: string
  whatsapp: string
  email: string
  valorTotalCentavos: number
  criadoEm: string
  expiraEm: string
  pagoEm: string | null
  retiradoEm: string | null
  accessToken: string
  itens: MockStoreOrderItem[]
  retiradas: string[]
  /** Pagamento aprovado no checkout falso: o "webhook" confirma depois deste instante (ms). */
  aprovacaoEm: number | null
}
