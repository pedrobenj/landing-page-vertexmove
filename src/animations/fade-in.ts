import type { Variants } from "framer-motion"

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export const staggerChildren: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
