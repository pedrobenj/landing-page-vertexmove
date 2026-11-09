"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

import { fadeUp } from "@/animations/reveal"
import { REVEAL_VIEWPORT } from "@/animations/motion-config"

interface RevealProps {
  children: ReactNode
  className?: string
  /** Atraso (s) da entrada. */
  delay?: number
  /** `mount`: anima ao carregar (conteúdo acima da dobra); `inView`: ao entrar na tela. */
  trigger?: "mount" | "inView"
}

/** Bloco que sobe levemente e aparece. O conteúdo já vem no HTML (SEO); só o estilo inicial é oculto. */
export function Reveal({ children, className, delay, trigger = "inView" }: RevealProps) {
  const target = trigger === "mount" ? { animate: "visible" } : { whileInView: "visible", viewport: REVEAL_VIEWPORT }

  return (
    <motion.div data-motion="" className={className} variants={fadeUp} custom={delay} initial="hidden" {...target}>
      {children}
    </motion.div>
  )
}
