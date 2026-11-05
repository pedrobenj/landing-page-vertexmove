import { RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { StoreVariant } from "@/types/store-product.interface"

interface SizeOptionProps {
  variant: StoreVariant
}

export function SizeOption({ variant }: SizeOptionProps) {
  const soldOut = variant.stock <= 0
  const id = `size-${variant.id}`
  return (
    <div>
      <RadioGroupItem value={variant.id} id={id} disabled={soldOut} className="peer sr-only" />
      <Label
        htmlFor={id}
        className={cn(
          "flex h-11 min-w-12 cursor-pointer items-center justify-center rounded-lg border px-3 font-semibold",
          "peer-data-[state=checked]:border-brand-navy peer-data-[state=checked]:bg-brand-navy peer-data-[state=checked]:text-white",
          "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
          soldOut && "cursor-not-allowed text-muted-foreground line-through opacity-60",
        )}
      >
        {variant.label}
        {soldOut && <span className="sr-only"> (esgotado)</span>}
      </Label>
    </div>
  )
}
