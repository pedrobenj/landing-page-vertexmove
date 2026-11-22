import { SelectItem } from "@/components/ui/select"

interface FilterSelectOptionProps {
  value: string
  label: string
}

export function FilterSelectOption({ value, label }: FilterSelectOptionProps) {
  return <SelectItem value={value}>{label}</SelectItem>
}
