import type { Variants } from "motion/react"

import { EASE_OUT } from "./motion-config"

/**
 * Sobe 16px e aparece. Usado nos itens de grades/listas e blocos isolados.
 * `custom` opcional = atraso (s); sem ele, o atraso vem da cascata do container.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay?: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT, ...(delay ? { delay } : {}) },
  }),
}

/** Container que só orquestra a cascata dos filhos (`fadeUp`). */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

/** Cascata mais curta para eyebrow → título → subtítulo. */
export const headingContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}
