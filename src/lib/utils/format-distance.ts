const kmFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 })

/** `5000 → "5 km"`, `21097 → "21,1 km"`, `800 → "800 m"`. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`
  return `${kmFormatter.format(meters / 1000)} km`
}
