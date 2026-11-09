"use client"

import { motion, useScroll, useSpring } from "motion/react"

/** Barra fina verde no topo indicando o progresso de rolagem da página. */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 })

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-brand-green"
    />
  )
}
