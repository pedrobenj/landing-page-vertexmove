import type { LucideIcon } from "lucide-react"

import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

interface LookupTypeOptionProps {
  value: string
  label: string
  icon: LucideIcon
}

/** Metade do seletor segmentado "WhatsApp / CPF". */
export function LookupTypeOption({ value, label, icon: Icon }: LookupTypeOptionProps) {
  const id = `lookup-type-${value}`
  return (
    <div className="flex-1">
      <RadioGroupItem value={value} id={id} className="peer sr-only" />
      <Label
        htmlFor={id}
        className={cn(
          "flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg font-bold text-muted-foreground transition-colors hover:text-brand-navy-deep",
          "peer-data-[state=checked]:bg-white peer-data-[state=checked]:text-brand-navy-deep peer-data-[state=checked]:shadow-sm",
          "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/60",
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </Label>
    </div>
  )
}
