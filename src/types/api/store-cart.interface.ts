import type { CART_ISSUE_REASON } from "@/enums/cart-issue-reason.enum"
import type { PRODUCT_TYPE } from "@/enums/product-type.enum"

/** Item enviado à API: só variante e quantidade (o preço vem sempre do servidor). */
export interface ApiCartItem {
  varianteId: string
  quantidade: number
}

export interface ApiPricedCartLine {
  varianteId: string
  produtoId: string
  produtoSlug: string
  produtoNome: string
  produtoTipo: PRODUCT_TYPE
  varianteRotulo: string
  fotoUrl: string | null
  precoUnitarioCentavos: number
  quantidade: number
  totalCentavos: number
  retirada: string
}

export interface ApiCartWarning {
  varianteId: string
  motivo: CART_ISSUE_REASON
  /** Quantidade que ainda pode ficar no carrinho (0 = sai do carrinho). */
  quantidadeDisponivel: number
}

/** `POST /loja/carrinho/precificar` e `error.dados.carrinho` do `409 CARRINHO_ALTERADO`. */
export interface ApiPricedCart {
  linhas: ApiPricedCartLine[]
  avisos: ApiCartWarning[]
  totalCentavos: number
  quantidadeItens: number
}
