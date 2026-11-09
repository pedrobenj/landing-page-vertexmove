import type { UseInViewOptions } from "motion/react"

/** Easing suave (ease-out-quint) usado em todas as entradas. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Revela uma vez, quando ~20% do bloco entra na tela. */
export const REVEAL_VIEWPORT = { once: true, amount: 0.2 } as const

/** Listas/grades podem ser altas (muitos cards no mobile): basta ~10% visível. */
export const LIST_VIEWPORT = { once: true, amount: 0.1 } as const

export const COUNTER_VIEWPORT: UseInViewOptions = { once: true, amount: 0.6 }

/** Duração da contagem dos números da comunidade (s). */
export const COUNTER_DURATION = 1.4
