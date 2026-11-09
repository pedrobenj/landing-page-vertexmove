"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"

import { fadeUp } from "@/animations/reveal"

const MOTION_TAGS = { li: motion.li, div: motion.div }

interface StaggerItemProps {
  children: ReactNode
  as?: keyof typeof MOTION_TAGS
  className?: string
}

/** Item de um `StaggerGroup`: herda o estado do grupo e entra na sua vez. */
export function StaggerItem({ children, as = "li", className }: StaggerItemProps) {
  const MotionTag = MOTION_TAGS[as]

  return (
    <MotionTag data-motion="" className={className} variants={fadeUp}>
      {children}
    </MotionTag>
  )
}
