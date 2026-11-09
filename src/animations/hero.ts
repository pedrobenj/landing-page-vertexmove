import type { Variants } from "motion/react"

import { EASE_OUT } from "./motion-config"

/** H1 do hero: cada palavra sobe ~0.4em, de levemente desfocada a nítida. */
export const heroTitle: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

export const heroWord: Variants = {
  hidden: { opacity: 0, y: "0.4em", filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: EASE_OUT } },
}

/** Atrasos (s) da cascata pílula → subtítulo → botões, iniciada enquanto as últimas palavras do título assentam. */
export const HERO_CASCADE_DELAYS = { pill: 0.45, subtitle: 0.55, actions: 0.65 } as const

/** Deslocamento máximo (px) do chevron de fundo ao rolar o hero. */
export const HERO_PARALLAX_DISTANCE = 80
