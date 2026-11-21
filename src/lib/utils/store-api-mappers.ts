import { CART_ISSUE_REASON } from "@/enums/cart-issue-reason.enum"
import type { CheckoutData } from "@/lib/validations/checkout.schema"
import type { ProductFormData } from "@/lib/validations/product.schema"
import type { ApiCartItem, ApiCartWarning, ApiPricedCart, ApiPricedCartLine } from "@/types/api/store-cart.interface"
import type { ApiCreateStoreOrder, ApiStoreOrderSummary } from "@/types/api/store-order.interface"
import type { ApiAdminStoreProduct, ApiSaveStoreProduct, ApiStoreProduct } from "@/types/api/store-product.interface"
import type { CartIssue, CartItem, PricedCart, PricedCartLine } from "@/types/cart.interface"
import type { OrderSummary } from "@/types/order.interface"
import type { StoreProduct } from "@/types/store-product.interface"

import { toE164Phone } from "./to-e164-phone"

/*
 * Tradução entre o contrato da loja na API (chaves em português, decisão L1) e os tipos que as telas
 * da loja já usam. Só o `endpoints/store.ts` chama estas funções.
 */

function isAdminProduct(product: ApiStoreProduct | ApiAdminStoreProduct): product is ApiAdminStoreProduct {
  return "ativo" in product
}

/** `ProdutoPublico` (ou o produto do admin) → `StoreProduct`. O público é sempre ativo. */
export function toStoreProduct(product: ApiStoreProduct | ApiAdminStoreProduct): StoreProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.nome,
    description: product.descricao,
    type: product.tipo,
    imageUrls: [...product.fotos].sort((a, b) => a.ordem - b.ordem).map((foto) => foto.url),
    price: product.precoCentavos,
    pickupInfo: product.retirada,
    isActive: isAdminProduct(product) ? product.ativo : true,
    isFeatured: product.destaque,
    variants: product.variantes.map((variante) => ({ id: variante.id, label: variante.rotulo, stock: variante.estoque })),
  }
}

function toPricedCartLine(line: ApiPricedCartLine): PricedCartLine {
  return {
    variantId: line.varianteId,
    productId: line.produtoId,
    productSlug: line.produtoSlug,
    productName: line.produtoNome,
    productType: line.produtoTipo,
    variantLabel: line.varianteRotulo,
    imageUrl: line.fotoUrl,
    unitPrice: line.precoUnitarioCentavos,
    quantity: line.quantidade,
    lineTotal: line.totalCentavos,
    pickupInfo: line.retirada,
  }
}

/** A API não manda texto nos avisos: o nome só existe quando a linha continua no carrinho. */
function describeWarning(warning: ApiCartWarning, line: ApiPricedCartLine | undefined): string {
  if (warning.motivo === CART_ISSUE_REASON.UNAVAILABLE) return "Um item do seu carrinho não está mais disponível"
  if (warning.quantidadeDisponivel <= 0 || !line) return "Um item do seu carrinho esgotou"
  return `Só restam ${warning.quantidadeDisponivel} unidades de ${line.produtoNome} (${line.varianteRotulo})`
}

/** `CarrinhoPrecificado` → `PricedCart`, com a mensagem de cada aviso para os toasts. */
export function toPricedCart(cart: ApiPricedCart): PricedCart {
  const linesByVariant = new Map(cart.linhas.map((line) => [line.varianteId, line]))
  const issues: CartIssue[] = cart.avisos.map((warning) => ({
    variantId: warning.varianteId,
    reason: warning.motivo,
    availableQuantity: warning.quantidadeDisponivel,
    message: describeWarning(warning, linesByVariant.get(warning.varianteId)),
  }))
  return {
    lines: cart.linhas.map(toPricedCartLine),
    issues,
    total: cart.totalCentavos,
    itemCount: cart.quantidadeItens,
  }
}

/** `ResumoPedido` → `OrderSummary`. */
export function toOrderSummary(order: ApiStoreOrderSummary): OrderSummary {
  return {
    code: order.codigo,
    status: order.status,
    amount: order.valorTotalCentavos,
    buyerFirstName: order.primeiroNome,
    createdAt: new Date(order.criadoEm),
    expiresAt: order.expiraEm ? new Date(order.expiraEm) : null,
    items: order.itens.map((item) => ({
      productName: item.produtoNome,
      variantLabel: item.varianteRotulo,
      quantity: item.quantidade,
      unitPrice: item.precoUnitarioCentavos,
    })),
    pickupInfos: order.retiradas,
  }
}

export function toApiCartItems(items: CartItem[]): ApiCartItem[] {
  return items.map((item) => ({ varianteId: item.variantId, quantidade: item.quantity }))
}

/** Checkout validado → corpo de `POST /loja/pedidos` (CPF só dígitos, WhatsApp em E.164). */
export function toApiCreateStoreOrder(input: CheckoutData): ApiCreateStoreOrder {
  return {
    nomeCompleto: input.name,
    cpf: input.cpf,
    whatsapp: toE164Phone(input.whatsapp),
    email: input.email,
    aceitePrivacidade: true,
    itens: toApiCartItems(input.items),
  }
}

/** Formulário do admin → corpo de `POST/PATCH /admin/loja/produtos`. */
export function toApiSaveStoreProduct(data: ProductFormData): ApiSaveStoreProduct {
  return {
    slug: data.slug,
    nome: data.name,
    descricao: data.description,
    tipo: data.type,
    precoCentavos: data.price,
    retirada: data.pickupInfo,
    ativo: data.isActive,
    destaque: data.isFeatured,
    variantes: data.variants.map((variant) => ({
      ...(variant.id ? { id: variant.id } : {}),
      rotulo: variant.label,
      estoque: variant.stock,
      ...(variant.id && variant.originalStock !== undefined ? { estoqueOriginal: variant.originalStock } : {}),
    })),
  }
}
