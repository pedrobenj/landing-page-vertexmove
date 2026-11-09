/** Lista paginada por cursor (`?cursor&limit`). */
export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
}
