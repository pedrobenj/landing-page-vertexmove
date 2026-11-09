"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn, getCarouselActivePage, getCarouselPageCount, getCarouselPageOffset } from "@/lib/utils"

import { HorizontalCarouselDot } from "./horizontal-carousel-dot"

interface HorizontalCarouselProps {
  /**
   * `HorizontalCarouselItem`s — cada item é um componente próprio no chamador.
   * As setas (desktop) ficam alinhadas à direita do cabeçalho logo acima (gap de 2.5rem do `SectionBand`).
   */
  children: ReactNode
  label: string
  className?: string
}

const SCROLL_RATIO = 0.85

/** Carrossel horizontal com scroll-snap, setas no desktop e indicadores. Sem bibliotecas. */
export function HorizontalCarousel({ children, label, className }: HorizontalCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [pageCount, setPageCount] = useState(1)
  const [activePage, setActivePage] = useState(0)
  const [edges, setEdges] = useState({ atStart: true, atEnd: true })

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const { scrollLeft, scrollWidth, clientWidth } = track
    const maxScroll = scrollWidth - clientWidth
    const pages = getCarouselPageCount(scrollWidth, clientWidth)
    setPageCount(pages)
    setActivePage(getCarouselActivePage(scrollLeft, maxScroll, pages))
    setEdges({ atStart: scrollLeft <= 4, atEnd: scrollLeft >= maxScroll - 4 })
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    track.addEventListener("scroll", measure, { passive: true })
    return () => {
      observer.disconnect()
      track.removeEventListener("scroll", measure)
    }
  }, [measure])

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * SCROLL_RATIO, behavior: "smooth" })
  }

  const scrollToPage = (page: number) => {
    const track = trackRef.current
    if (!track) return
    const maxScroll = track.scrollWidth - track.clientWidth
    track.scrollTo({ left: getCarouselPageOffset(page, maxScroll, pageCount), behavior: "smooth" })
  }

  const hasOverflow = pageCount > 1

  return (
    <div role="region" aria-roledescription="carrossel" aria-label={label} className={cn("relative flex flex-col gap-6", className)}>
      {hasOverflow && (
        <div className="absolute right-0 bottom-[calc(100%+2.5rem)] hidden gap-2 md:flex">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-full shadow-sm"
            onClick={() => scrollByPage(-1)}
            disabled={edges.atStart}
            aria-label="Anterior"
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-full shadow-sm"
            onClick={() => scrollByPage(1)}
            disabled={edges.atEnd}
            aria-label="Próximo"
          >
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      )}

      <ul
        ref={trackRef}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>

      {hasOverflow && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: pageCount }, (_, page) => (
            <HorizontalCarouselDot
              key={page}
              page={page}
              isActive={page === activePage}
              onSelect={scrollToPage}
            />
          ))}
        </div>
      )}
    </div>
  )
}
