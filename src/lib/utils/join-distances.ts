/** `["5 km", "10 km"] → "5 km | 10 km"`. */
export function joinDistances(distances: readonly string[]): string {
  return distances.filter(Boolean).join(" | ")
}
