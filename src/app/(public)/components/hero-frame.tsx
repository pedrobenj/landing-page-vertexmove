import type { ReactNode } from "react"

import { Chevron } from "@/components/brand"
import { ParallaxLayer } from "@/components/motion"

interface HeroFrameProps {
  children: ReactNode
}

/** Moldura navy do hero com o pico gigante esmaecido ao fundo (marca d'água da página). */
export function HeroFrame({ children }: HeroFrameProps) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-brand-navy-deep text-white">
      <div className="pointer-events-none absolute -bottom-24 -left-20 w-[34rem] sm:-left-10 lg:w-[46rem]">
        <ParallaxLayer>
          <Chevron className="w-full opacity-[0.07]" />
        </ParallaxLayer>
      </div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-24">
        {children}
      </div>
    </section>
  )
}
