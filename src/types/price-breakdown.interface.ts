export interface PriceBreakdown {
  /** Todos os valores em centavos. */
  tierPrice: number
  kitExtraPrice: number
  seniorDiscount: number
  couponDiscount: number
  total: number
  priceTierId: string
  priceTierName: string
}
