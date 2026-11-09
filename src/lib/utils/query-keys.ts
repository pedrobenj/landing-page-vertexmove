import type { CartItem } from "@/types/cart.interface"

export const queryKeys = {
  events: {
    all: ["events"] as const,
    public: () => [...queryKeys.events.all, "public"] as const,
    detail: (slug: string) => [...queryKeys.events.all, "detail", slug] as const,
  },
  admin: {
    all: ["admin"] as const,
    events: (filters: { status?: string | null; cursor?: string | null }) =>
      [...queryKeys.admin.all, "events", filters] as const,
    event: (id: number) => [...queryKeys.admin.all, "event", id] as const,
    distances: (eventId: number) => [...queryKeys.admin.all, "distances", eventId] as const,
    priceTiers: (distanceId: number) => [...queryKeys.admin.all, "price-tiers", distanceId] as const,
    kits: (eventId: number) => [...queryKeys.admin.all, "kits", eventId] as const,
    documents: (eventId: number) => [...queryKeys.admin.all, "documents", eventId] as const,
    shirtSizes: () => [...queryKeys.admin.all, "shirt-sizes"] as const,
    audit: (cursor: string | null) => [...queryKeys.admin.all, "audit", cursor] as const,
  },
  registrations: {
    all: ["registrations"] as const,
    /** Chave de mutação da consulta: CPF/WhatsApp nunca entram em chaves de cache (LGPD). */
    lookup: () => [...queryKeys.registrations.all, "lookup"] as const,
  },
  store: {
    all: ["store"] as const,
    cart: (items: CartItem[]) => [...queryKeys.store.all, "cart", items] as const,
  },
}
