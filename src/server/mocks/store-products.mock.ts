import { PRODUCT_TYPE } from "@/enums/product-type.enum"
import type { StoreProduct } from "@/types/store-product.interface"

const PICKUP_SEDE = "Retirada na sede do Vertex (Aterrinho da Praia de Iracema), sábados das 7h às 10h."
const PICKUP_KIT = "Retirada junto com o kit da Corrida Vertex Beira-Mar 2026, 04 e 05/12, das 9h às 18h."

/**
 * Catálogo fictício da loja (a loja ainda não existe na API; ver Task 20 do plano de migração).
 * - camisa-oficial-vertex-2026: tamanho G esgotado (teste de tamanho desabilitado)
 * - camisa-treino-dry-fit: estoque alto (fluxo de checkout nos testes)
 * - regata-vertex-run: totalmente esgotada (selo "Esgotado")
 * - camisa-edicao-limitada-2024: inativa (não pode aparecer)
 */
export const STORE_PRODUCTS_MOCK: StoreProduct[] = [
  {
    id: "mock-prod-1",
    slug: "camisa-oficial-vertex-2026",
    name: "Camisa Oficial Vertex 2026",
    description: "Camisa oficial da temporada 2026, tecido dry-fit leve com proteção UV. Azul-marinho com detalhes em verde.",
    type: PRODUCT_TYPE.SHIRT,
    imageUrls: [],
    price: 8990,
    pickupInfo: PICKUP_KIT,
    isActive: true,
    isFeatured: true,
    variants: [
      { id: "mock-var-1-p", label: "P", stock: 10 },
      { id: "mock-var-1-m", label: "M", stock: 15 },
      { id: "mock-var-1-g", label: "G", stock: 0 },
      { id: "mock-var-1-gg", label: "GG", stock: 5 },
    ],
  },
  {
    id: "mock-prod-2",
    slug: "camisa-treino-dry-fit",
    name: "Camisa Treino Dry-Fit",
    description: "Camisa de treino do grupo, ideal para os treinos na Beira-Mar. Secagem rápida.",
    type: PRODUCT_TYPE.SHIRT,
    imageUrls: [],
    price: 6990,
    pickupInfo: PICKUP_SEDE,
    isActive: true,
    isFeatured: true,
    variants: [
      { id: "mock-var-2-p", label: "P", stock: 500 },
      { id: "mock-var-2-m", label: "M", stock: 500 },
      { id: "mock-var-2-g", label: "G", stock: 500 },
      { id: "mock-var-2-gg", label: "GG", stock: 500 },
    ],
  },
  {
    id: "mock-prod-3",
    slug: "regata-vertex-run",
    name: "Regata Vertex Run",
    description: "Regata leve para provas de calor. Edição esgotada.",
    type: PRODUCT_TYPE.SHIRT,
    imageUrls: [],
    price: 5990,
    pickupInfo: PICKUP_SEDE,
    isActive: true,
    isFeatured: false,
    variants: [
      { id: "mock-var-3-p", label: "P", stock: 0 },
      { id: "mock-var-3-m", label: "M", stock: 0 },
      { id: "mock-var-3-g", label: "G", stock: 0 },
    ],
  },
  {
    id: "mock-prod-4",
    slug: "medalha-corrida-beira-mar-2025",
    name: "Medalha Corrida Beira-Mar 2025",
    description: "Medalha da edição 2025 da Corrida Vertex Beira-Mar. Complete sua coleção!",
    type: PRODUCT_TYPE.MEDAL,
    imageUrls: [],
    price: 3500,
    pickupInfo: PICKUP_SEDE,
    isActive: true,
    isFeatured: true,
    variants: [{ id: "mock-var-4-u", label: "Única", stock: 30 }],
  },
  {
    id: "mock-prod-5",
    slug: "medalha-night-run-2025",
    name: "Medalha Night Run 2025",
    description: "Medalha da Night Run Vertex 2025, com acabamento que brilha no escuro.",
    type: PRODUCT_TYPE.MEDAL,
    imageUrls: [],
    price: 3500,
    pickupInfo: PICKUP_SEDE,
    isActive: true,
    isFeatured: false,
    variants: [{ id: "mock-var-5-u", label: "Única", stock: 12 }],
  },
  {
    id: "mock-prod-6",
    slug: "camisa-edicao-limitada-2024",
    name: "Camisa Edição Limitada 2024",
    description: "Produto desativado — não deve aparecer na loja.",
    type: PRODUCT_TYPE.SHIRT,
    imageUrls: [],
    price: 9990,
    pickupInfo: PICKUP_SEDE,
    isActive: false,
    isFeatured: true,
    variants: [{ id: "mock-var-6-m", label: "M", stock: 3 }],
  },
]
