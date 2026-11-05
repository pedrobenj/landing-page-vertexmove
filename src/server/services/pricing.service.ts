import "server-only"

import type { CouponType } from "@/generated/prisma/enums"
import { SENIOR_DISCOUNT_MIN_AGE, calcAge } from "@/lib/utils"
import type { PriceBreakdown } from "@/types/price-breakdown.interface"

interface TierCandidate {
  id: string
  name: string
  price: number
  startsAt: Date
  endsAt: Date
  maxSlots: number | null
  /** Inscrições ativas (PAID + PENDING não expiradas) já feitas neste lote. */
  usedSlots: number
}

interface CouponCandidate {
  type: CouponType
  value: number
}

interface CalculatePriceParams {
  tier: Pick<TierCandidate, "id" | "name" | "price">
  kitExtraPrice: number
  birthDate: Date
  eventDate: Date
  coupon?: CouponCandidate | null
}

// TODO(cliente): confirmar percentual e regras do desconto 60+ (CLAUDE.md §15).
const SENIOR_DISCOUNT_PERCENT = 50

/** Lote vigente pela data atual e, se houver `maxSlots`, pelas vagas do lote. */
export function getActivePriceTier<T extends TierCandidate>(tiers: T[], now = new Date()): T | null {
  return (
    [...tiers]
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
      .find(
        (tier) =>
          tier.startsAt <= now &&
          tier.endsAt > now &&
          (tier.maxSlots === null || tier.usedSlots < tier.maxSlots),
      ) ?? null
  )
}

function applyPercent(amount: number, percent: number): number {
  return Math.round((amount * percent) / 100)
}

/** Cálculo de preço — sempre no servidor, nunca confiar em valores vindos do client. */
export function calculatePrice({
  tier,
  kitExtraPrice,
  birthDate,
  eventDate,
  coupon,
}: CalculatePriceParams): PriceBreakdown {
  const isSenior = calcAge(birthDate, eventDate) >= SENIOR_DISCOUNT_MIN_AGE
  const seniorDiscount = isSenior ? applyPercent(tier.price, SENIOR_DISCOUNT_PERCENT) : 0

  const subtotal = tier.price - seniorDiscount + kitExtraPrice
  const couponDiscount = !coupon
    ? 0
    : coupon.type === "PERCENT"
      ? applyPercent(subtotal, coupon.value)
      : Math.min(coupon.value, subtotal)

  return {
    tierPrice: tier.price,
    kitExtraPrice,
    seniorDiscount,
    couponDiscount,
    total: Math.max(subtotal - couponDiscount, 0),
    priceTierId: tier.id,
    priceTierName: tier.name,
  }
}
