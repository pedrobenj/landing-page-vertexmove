"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn, getCarouselActivePage, getCarouselPageCount, getCarouselPageOffset } from "@/lib/utils"

import { HorizontalCarouselDot } from "./horizontal-carousel-dot"

interface HorizontalCarouselProps {
  /**
   * `HorizontalCarouselItem`s — cada item é um componente próprio no chamador.
   * As setas (desktop largo, `lg`) ficam alinhadas à direita do cabeçalho logo acima (gap de 2.5rem do `SectionBand`).
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

  const frameRef = useRef<number | null>(null)

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const { scrollLeft, scrollWidth, clientWidth } = track
    const maxScroll = scrollWidth - clientWidth
    const pages = getCarouselPageCount(scrollWidth, clientWidth)
    const page = getCarouselActivePage(scrollLeft, maxScroll, pages)
    const atStart = scrollLeft <= 4
    const atEnd = scrollLeft >= maxScroll - 4
    // Só atualiza o que mudou: o scroll dispara dezenas de eventos por segundo.
    setPageCount((current) => (current === pages ? current : pages))
    setActivePage((current) => (current === page ? current : page))
    setEdges((current) => (current.atStart === atStart && current.atEnd === atEnd ? current : { atStart, atEnd }))
  }, [])

  /** Agrupa as medições num frame de animação (scroll e resize). */
  const scheduleMeasure = useCallback(() => {
    if (frameRef.current !== null) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      measure()
    })
  }, [measure])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    measure()
    const observer = new ResizeObserver(scheduleMeasure)
    observer.observe(track)
    track.addEventListener("scroll", scheduleMeasure, { passive: true })
    return () => {
      observer.disconnect()
      track.removeEventListener("scroll", scheduleMeasure)
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [measure, scheduleMeasure])

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

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    event.preventDefault()
    scrollByPage(event.key === "ArrowRight" ? 1 : -1)
  }

  const hasOverflow = pageCount > 1

  return (
    <div role="region" aria-roledescription="carrossel" aria-label={label} className={cn("relative flex flex-col gap-6", className)}>
      {hasOverflow && (
        <div className="absolute right-0 bottom-[calc(100%+2.5rem)] hidden gap-2 lg:flex">
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
        tabIndex={0}
        aria-label={`${label} (use as setas do teclado para navegar)`}
        onKeyDown={handleKeyDown}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
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
