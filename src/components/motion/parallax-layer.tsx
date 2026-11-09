"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import type { ReactNode } from "react"

import { HERO_PARALLAX_DISTANCE } from "@/animations/hero"

interface ParallaxLayerProps {
  children: ReactNode
  className?: string
  /** Deslocamento (px) quando a página rola uma altura de tela. */
  distance?: number
}

/** Camada decorativa que desce mais devagar que o conteúdo ao rolar (parallax leve). */
export function ParallaxLayer({ children, className, distance = HERO_PARALLAX_DISTANCE }: ParallaxLayerProps) {
  const shouldReduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 800], [0, distance], { clamp: true })

  return (
    <motion.div aria-hidden="true" className={className} style={shouldReduceMotion ? undefined : { y }}>
      {children}
    </motion.div>
  )
}
