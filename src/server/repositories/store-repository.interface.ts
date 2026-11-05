import type { ProductFormData } from "@/lib/validations/product.schema"
import type { CreatePendingOrderResult, NewOrderData, OrderSummary } from "@/types/order.interface"
import type { StoreProduct } from "@/types/store-product.interface"

export interface StoreRepository {
  listActiveProducts(): Promise<StoreProduct[]>
  listFeaturedProducts(limit: number): Promise<StoreProduct[]>
  getActiveProductBySlug(slug: string): Promise<StoreProduct | null>
  /** Produtos (ativos ou não) que contêm alguma das variantes. */
  getProductsByVariantIds(variantIds: string[]): Promise<StoreProduct[]>
  /** Baixa o estoque de forma atômica e cria o pedido PENDING. Gera o código internamente. */
  createPendingOrder(data: NewOrderData): Promise<CreatePendingOrderResult>
  getOrderSummaryByCode(code: string): Promise<OrderSummary | null>

  // Admin
  listAllProducts(): Promise<StoreProduct[]>
  getProductById(id: string): Promise<StoreProduct | null>
  /**
   * Cria (sem id) ou atualiza. Na edição, o estoque de tamanhos salvos é aplicado como diferença
   * (`stock - originalStock`) sobre o estoque atual, e tamanhos omitidos são mantidos.
   * Lança DuplicateSlugError, DuplicateVariantLabelError, VariantNotOwnedError ou StockChangedError.
   */
  saveProduct(data: ProductFormData, id?: string): Promise<StoreProduct>
}
