import { cn } from "@/lib/utils"

interface ChevronProps {
  className?: string
}

/** Pico/chevron verde — elemento-assinatura da marca. Um uso marcante por tela. */
export function Chevron({ className }: ChevronProps) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      aria-hidden="true"
      className={cn("text-brand-green", className)}
    >
      <path d="M4 36 32 6l28 30" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
