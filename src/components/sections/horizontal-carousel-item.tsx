import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface HorizontalCarouselItemProps {
  children: ReactNode
  className?: string
}

/** Item do `HorizontalCarousel`. A largura vem do chamador (padrão: ~3 por linha no desktop). */
export function HorizontalCarouselItem({ children, className }: HorizontalCarouselItemProps) {
  return (
    <li className={cn("w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[calc((100%-2rem)/3)]", className)}>{children}</li>
  )
}
