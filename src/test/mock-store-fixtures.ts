import { PRODUCT_TYPE } from "@/enums/product-type.enum"
import type { ApiCreateStoreOrder } from "@/types/api/store-order.interface"

import type { MockStoreProduct } from "@/server/api/mocks/store/mock-store-types"

/** Produto do mock para os testes (formato da API): P com 5 unidades, M esgotado. */
export function buildMockProduct(overrides: Partial<MockStoreProduct> = {}): MockStoreProduct {
  return {
    id: "1",
    slug: "camisa-teste",
    nome: "Camisa Teste",
    descricao: "Camisa para testes automatizados.",
    tipo: PRODUCT_TYPE.SHIRT,
    precoCentavos: 8990,
    retirada: "Retirada na sede",
    ativo: true,
    destaque: false,
    ordem: 1,
    fotos: [],
    variantes: [
      { id: "11", rotulo: "P", estoque: 5 },
      { id: "12", rotulo: "M", estoque: 0 },
    ],
    ...overrides,
  }
}

export function buildMockOrderInput(varianteId: string, quantidade: number): ApiCreateStoreOrder {
  return {
    nomeCompleto: "Maria Silva",
    cpf: "52998224725",
    whatsapp: "+5585988887777",
    email: "m@x.com",
    aceitePrivacidade: true,
    itens: [{ varianteId, quantidade }],
  }
}
