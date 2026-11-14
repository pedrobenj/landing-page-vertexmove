import { CircleCheck, CircleX } from "lucide-react"
import Link from "next/link"

import type { ReadinessItemConfig } from "@/lib/utils/readiness-items"

interface ReadinessCheckItemProps {
  config: ReadinessItemConfig
  done: boolean
  eventId: number
}

/** Um item do checklist; o que falta linka para a tela onde se resolve. */
export function ReadinessCheckItem({ config, done, eventId }: ReadinessCheckItemProps) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {done ? (
        <CircleCheck className="size-4 shrink-0 text-brand-green-text" aria-hidden="true" />
      ) : (
        <CircleX className="size-4 shrink-0 text-destructive" aria-hidden="true" />
      )}
      <span className="sr-only">{done ? "Feito:" : "Falta:"}</span>
      {done ? (
        <span className="text-muted-foreground">{config.label}</span>
      ) : (
        <Link href={`/admin/eventos/${eventId}/${config.section}`} className="font-medium text-brand-navy underline-offset-4 hover:underline">
          {config.label}
        </Link>
      )}
    </li>
  )
}
