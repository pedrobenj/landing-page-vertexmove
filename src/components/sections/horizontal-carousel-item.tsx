import type { ReactNode } from "react"

import { StaggerItem } from "@/components/motion"
import { cn } from "@/lib/utils"

interface HorizontalCarouselItemProps {
  children: ReactNode
  /** Posição (1-based) e total, anunciados como "N de M" pelos leitores de tela. */
  position: number
  total: number
  className?: string
}

/** Item do `HorizontalCarousel` (slide dentro de um item de lista, padrão APG). A largura vem do chamador (padrão: ~3 por linha no desktop). */
export function HorizontalCarouselItem({ children, position, total, className }: HorizontalCarouselItemProps) {
  return (
    <StaggerItem className={cn("w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[calc((100%-2rem)/3)]", className)}>
      <div role="group" aria-roledescription="slide" aria-label={`${position} de ${total}`} className="h-full">
        {children}
      </div>
    </StaggerItem>
  )
}
