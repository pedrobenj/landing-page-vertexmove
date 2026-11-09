import { cn } from "@/lib/utils"

interface HorizontalCarouselDotProps {
  page: number
  isActive: boolean
  onSelect: (page: number) => void
}

export function HorizontalCarouselDot({ page, isActive, onSelect }: HorizontalCarouselDotProps) {
  return (
    <button
      type="button"
      aria-label={`Ir para a página ${page + 1}`}
      aria-current={isActive ? "true" : undefined}
      onClick={() => onSelect(page)}
      className="flex h-6 min-w-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 rounded-full transition-all",
          isActive ? "w-6 bg-brand-green-text" : "w-1.5 bg-slate-300",
        )}
      />
    </button>
  )
}
