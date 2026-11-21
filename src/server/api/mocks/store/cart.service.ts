import "server-only"

import { CART_ISSUE_REASON } from "@/enums/cart-issue-reason.enum"
import type { ApiCartItem, ApiCartWarning, ApiPricedCart, ApiPricedCartLine } from "@/types/api/store-cart.interface"

import type { MockStoreProduct, MockStoreVariant } from "./mock-store-types"

interface VariantMatch {
  product: MockStoreProduct
  variant: MockStoreVariant
}

function indexVariants(products: MockStoreProduct[]): Map<string, VariantMatch> {
  const index = new Map<string, VariantMatch>()
  for (const product of products) {
    for (const variant of product.variantes) index.set(variant.id, { product, variant })
  }
  return index
}

/**
 * Precifica o carrinho com os dados ATUAIS (preço, estoque, produto e variante ativos), como o
 * `precificar-carrinho.ts` do backend: o corpo só traz `varianteId` e `quantidade`.
 * Esgotado = `estoque_insuficiente` com 0 (sai do carrinho).
 */
export function priceCart(items: ApiCartItem[], products: MockStoreProduct[]): ApiPricedCart {
  const index = indexVariants(products)
  const linhas: ApiPricedCartLine[] = []
  const avisos: ApiCartWarning[] = []

  for (const item of items) {
    const match = index.get(item.varianteId)
    if (!match || !match.product.ativo || match.variant.ativo === false) {
      avisos.push({ varianteId: item.varianteId, motivo: CART_ISSUE_REASON.UNAVAILABLE, quantidadeDisponivel: 0 })
      continue
    }

    const quantidade = Math.min(item.quantidade, match.variant.estoque)
    if (quantidade < item.quantidade) {
      avisos.push({ varianteId: item.varianteId, motivo: CART_ISSUE_REASON.INSUFFICIENT_STOCK, quantidadeDisponivel: quantidade })
    }
    if (quantidade <= 0) continue

    linhas.push({
      varianteId: match.variant.id,
      produtoId: match.product.id,
      produtoSlug: match.product.slug,
      produtoNome: match.product.nome,
      produtoTipo: match.product.tipo,
      varianteRotulo: match.variant.rotulo,
      fotoUrl: [...match.product.fotos].sort((a, b) => a.ordem - b.ordem)[0]?.url ?? null,
      precoUnitarioCentavos: match.product.precoCentavos,
      quantidade,
      totalCentavos: match.product.precoCentavos * quantidade,
      retirada: match.product.retirada,
    })
  }

  return {
    linhas,
    avisos,
    totalCentavos: linhas.reduce((sum, line) => sum + line.totalCentavos, 0),
    quantidadeItens: linhas.reduce((sum, line) => sum + line.quantidade, 0),
  }
}
