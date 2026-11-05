import type { RegistrationFilters } from "@/types/registration-filters.interface"

export const queryKeys = {
  events: {
    all: ["events"] as const,
    open: () => [...queryKeys.events.all, "open"] as const,
    detail: (slug: string) => [...queryKeys.events.all, "detail", slug] as const,
  },
  registrations: {
    all: ["registrations"] as const,
    byCode: (code: string) => [...queryKeys.registrations.all, "code", code] as const,
    paymentStatus: (code: string) => [...queryKeys.registrations.all, "payment-status", code] as const,
    admin: (eventId: string, filters: RegistrationFilters) =>
      [...queryKeys.registrations.all, "admin", eventId, filters] as const,
  },
}
