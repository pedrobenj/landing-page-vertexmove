import { describe, expect, it } from "vitest"

import { getCarouselActivePage, getCarouselPageCount, getCarouselPageOffset } from "./carousel-pages"

describe("carousel-pages", () => {
  it("conta as páginas com tolerância", () => {
    expect(getCarouselPageCount(1000, 1000)).toBe(1)
    expect(getCarouselPageCount(1020, 1000)).toBe(1)
    expect(getCarouselPageCount(1500, 1000)).toBe(2)
    expect(getCarouselPageCount(3000, 1000)).toBe(3)
    expect(getCarouselPageCount(500, 0)).toBe(1)
  })

  it("calcula a página ativa", () => {
    expect(getCarouselActivePage(0, 1000, 3)).toBe(0)
    expect(getCarouselActivePage(500, 1000, 3)).toBe(1)
    expect(getCarouselActivePage(1000, 1000, 3)).toBe(2)
    expect(getCarouselActivePage(200, 0, 3)).toBe(0)
  })

  it("calcula o deslocamento de cada página", () => {
    expect(getCarouselPageOffset(0, 1000, 3)).toBe(0)
    expect(getCarouselPageOffset(1, 1000, 3)).toBe(500)
    expect(getCarouselPageOffset(2, 1000, 1)).toBe(0)
  })
})
