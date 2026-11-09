import type { EventLocation } from "@/types/api/event.interface"

/** `"Av. Beira Mar, s/n — Meireles, Fortaleza/CE"`; partes ausentes são omitidas. */
export function formatEventAddress(location: EventLocation): string {
  const street = [location.endereco, location.complemento].filter(Boolean).join(", ")
  const city = `${location.cidade}/${location.uf}`
  const district = [location.bairro, city].filter(Boolean).join(", ")
  return [street, district].filter(Boolean).join(" — ")
}
