import type { PRODUCT_TYPE } from "@/enums/product-type.enum"

/** Foto do produto (`ProdutoPublico.fotos`), na ordem de exibição. */
export interface ApiStoreProductPhoto {
  url: string
  alt: string | null
  ordem: number
}

/** Tamanho/variante à venda (`ProdutoPublico.variantes`). Ids em string. */
export interface ApiStoreVariant {
  id: string
  rotulo: string
  estoque: number
}

/** `GET /loja/produtos` e `GET /loja/produtos/:slug` (só produtos ativos). */
export interface ApiStoreProduct {
  id: string
  slug: string
  nome: string
  descricao: string
  tipo: PRODUCT_TYPE
  precoCentavos: number
  /** Texto livre: local e horário de retirada. */
  retirada: string
  destaque: boolean
  fotos: ApiStoreProductPhoto[]
  variantes: ApiStoreVariant[]
}

/** Variante no admin: só as ativas, com a ordem. */
export interface ApiAdminStoreVariant extends ApiStoreVariant {
  ordem: number
}

/** `GET /admin/loja/produtos[/:id]` (`produto-admin.presenter.ts`): o produto público mais os campos de gestão. */
export interface ApiAdminStoreProduct extends Omit<ApiStoreProduct, "variantes"> {
  ativo: boolean
  ordem: number
  variantes: ApiAdminStoreVariant[]
  criadoEm: string
  atualizadoEm: string
}

/** Variante no corpo de `POST/PATCH /admin/loja/produtos`. Salvas mandam `id` e `estoqueOriginal`. */
export interface ApiSaveStoreVariant {
  id?: string
  rotulo: string
  estoque: number
  /** Estoque quando o formulário abriu: o backend aplica só a diferença. */
  estoqueOriginal?: number
}

/** Corpo de `POST /admin/loja/produtos` e `PATCH /admin/loja/produtos/:id`. */
export interface ApiSaveStoreProduct {
  slug: string
  nome: string
  descricao: string
  tipo: PRODUCT_TYPE
  precoCentavos: number
  retirada: string
  ativo: boolean
  destaque: boolean
  variantes: ApiSaveStoreVariant[]
}
