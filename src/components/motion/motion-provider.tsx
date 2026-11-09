"use client"

import { MotionConfig } from "motion/react"
import type { ReactNode } from "react"

interface MotionProviderProps {
  children: ReactNode
}

/** Respeita `prefers-reduced-motion`: sem deslocamentos para quem pediu menos movimento (o CSS global garante o estado final). */
export function MotionProvider({ children }: MotionProviderProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
