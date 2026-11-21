import { getFirstName } from "@/lib/utils/get-first-name"
import { maskCpf } from "@/lib/utils/masks"
import type {
  ApiAdminStoreOrder,
  ApiAdminStoreOrderDetails,
  ApiStoreOrderSummary,
} from "@/types/api/store-order.interface"
import type { ApiAdminStoreProduct, ApiStoreProduct } from "@/types/api/store-product.interface"

import type { MockStoreOrder, MockStoreProduct } from "./mock-store-types"

/** Respostas do mock da loja no formato exato dos presenters do backend (`src/modules/loja/http/presenters`). */

function activeVariants(product: MockStoreProduct) {
  return product.variantes
    .filter((variant) => variant.ativo !== false)
    .map(({ id, rotulo, estoque }) => ({ id, rotulo, estoque }))
}

export function presentPublicProduct(product: MockStoreProduct): ApiStoreProduct {
  return {
    id: product.id,
    slug: product.slug,
    nome: product.nome,
    descricao: product.descricao,
    tipo: product.tipo,
    precoCentavos: product.precoCentavos,
    retirada: product.retirada,
    destaque: product.destaque,
    fotos: [...product.fotos].sort((a, b) => a.ordem - b.ordem),
    variantes: activeVariants(product),
  }
}

export function presentAdminProduct(product: MockStoreProduct): ApiAdminStoreProduct {
  return { ...presentPublicProduct(product), ativo: product.ativo, ordem: product.ordem }
}

/** Resumo público: só o primeiro nome, sem CPF, WhatsApp e e-mail. */
export function presentOrderSummary(order: MockStoreOrder): ApiStoreOrderSummary {
  return {
    codigo: order.codigo,
    status: order.status,
    valorTotalCentavos: order.valorTotalCentavos,
    primeiroNome: getFirstName(order.nomeCompleto),
    criadoEm: order.criadoEm,
    expiraEm: order.expiraEm,
    itens: order.itens.map(({ produtoNome, varianteRotulo, quantidade, precoUnitarioCentavos }) => ({
      produtoNome,
      varianteRotulo,
      quantidade,
      precoUnitarioCentavos,
    })),
    retiradas: order.retiradas,
  }
}

export function presentAdminOrder(order: MockStoreOrder): ApiAdminStoreOrder {
  return {
    codigo: order.codigo,
    status: order.status,
    nomeCompleto: order.nomeCompleto,
    valorTotalCentavos: order.valorTotalCentavos,
    quantidadeItens: order.itens.reduce((sum, item) => sum + item.quantidade, 0),
    criadoEm: order.criadoEm,
    expiraEm: order.expiraEm,
    pagoEm: order.pagoEm,
  }
}

export function presentAdminOrderDetails(order: MockStoreOrder): ApiAdminStoreOrderDetails {
  const { itens, retiradas } = presentOrderSummary(order)
  return {
    ...presentAdminOrder(order),
    whatsapp: order.whatsapp,
    email: order.email,
    cpfMascarado: maskCpf(order.cpf),
    retiradoEm: order.retiradoEm,
    itens,
    retiradas,
  }
}
