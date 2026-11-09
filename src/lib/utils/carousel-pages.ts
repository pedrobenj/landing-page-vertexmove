/** Tolerância para não criar uma "página" extra por causa de poucos pixels de sobra. */
const PAGE_TOLERANCE = 0.05

/** Quantas "páginas" (larguras visíveis) cabem no conteúdo rolável. Mínimo 1. */
export function getCarouselPageCount(scrollWidth: number, clientWidth: number): number {
  if (clientWidth <= 0) return 1
  return Math.max(1, Math.ceil(scrollWidth / clientWidth - PAGE_TOLERANCE))
}

/** Página ativa a partir da posição de rolagem, distribuída entre 0 e `pageCount - 1`. */
export function getCarouselActivePage(scrollLeft: number, maxScroll: number, pageCount: number): number {
  if (maxScroll <= 0 || pageCount <= 1) return 0
  const ratio = Math.min(1, Math.max(0, scrollLeft / maxScroll))
  return Math.round(ratio * (pageCount - 1))
}

/** Posição de rolagem (px) da página `page`. */
export function getCarouselPageOffset(page: number, maxScroll: number, pageCount: number): number {
  if (maxScroll <= 0 || pageCount <= 1) return 0
  return (maxScroll * page) / (pageCount - 1)
}
