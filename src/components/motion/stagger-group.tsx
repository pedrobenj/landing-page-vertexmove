"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

import { LIST_VIEWPORT, REVEAL_VIEWPORT } from "@/animations/motion-config"
import { headingContainer, staggerContainer } from "@/animations/reveal"

const MOTION_TAGS = { ul: motion.ul, ol: motion.ol, div: motion.div }

interface StaggerGroupProps {
  /** `StaggerItem`s (direta ou indiretamente): entram em cascata quando o grupo aparece na tela. */
  children: ReactNode
  as?: keyof typeof MOTION_TAGS
  /** `list`: grades e carrosséis; `heading`: eyebrow → título → subtítulo. */
  variant?: "list" | "heading"
  className?: string
  "aria-label"?: string
}

/** Container que dispara a cascata dos filhos ao entrar na tela (uma vez). */
export function StaggerGroup({ children, as = "div", variant = "list", className, "aria-label": ariaLabel }: StaggerGroupProps) {
  const MotionTag = MOTION_TAGS[as]
  const isList = variant === "list"

  return (
    <MotionTag
      className={className}
      aria-label={ariaLabel}
      variants={isList ? staggerContainer : headingContainer}
      initial="hidden"
      whileInView="visible"
      viewport={isList ? LIST_VIEWPORT : REVEAL_VIEWPORT}
    >
      {children}
    </MotionTag>
  )
}
