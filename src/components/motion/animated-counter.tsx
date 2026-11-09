"use client"

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import { useEffect, useMemo, useRef } from "react"

import { COUNTER_DURATION, COUNTER_VIEWPORT, EASE_OUT } from "@/animations/motion-config"
import { formatCountValue, parseCountValue } from "@/lib/utils"

interface AnimatedCounterProps {
  /** Texto do indicador, ex.: "3.500+". Formatos não numéricos são exibidos sem animação. */
  value: string
  className?: string
}

/**
 * Conta de 0 até o valor quando entra na tela. O HTML (SSR) já traz o valor final,
 * que também fica para quem prefere menos movimento; leitores de tela leem só o valor final.
 */
export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const count = useMemo(() => parseCountValue(value), [value])
  const shouldReduceMotion = useReducedMotion()
  const isInView = useInView(ref, COUNTER_VIEWPORT)
  const current = useMotionValue(count?.value ?? 0)
  const display = useTransform(current, (latest) => (count ? formatCountValue(count, latest) : value))

  useEffect(() => {
    if (!count || shouldReduceMotion) return
    if (!isInView) {
      current.set(0)
      return
    }
    const controls = animate(current, count.value, { duration: COUNTER_DURATION, ease: EASE_OUT })
    return () => {
      controls.stop()
      current.set(count.value)
    }
  }, [count, current, isInView, shouldReduceMotion])

  return (
    <span className={className}>
      <motion.span ref={ref} aria-hidden="true" className="tabular-nums">
        {display}
      </motion.span>
      <span className="sr-only">{value}</span>
    </span>
  )
}
