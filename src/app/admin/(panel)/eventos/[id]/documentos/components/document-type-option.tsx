import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"

interface DocumentTypeOptionProps {
  idPrefix: string
  value: string
  label: string
}

export function DocumentTypeOption({ idPrefix, value, label }: DocumentTypeOptionProps) {
  const id = `${idPrefix}-tipo-${value}`
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem value={value} id={id} />
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
    </div>
  )
}
