import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { EventFaqEntry } from "@/lib/utils"

interface EventFaqItemProps {
  entry: EventFaqEntry
  value: string
}

export function EventFaqItem({ entry, value }: EventFaqItemProps) {
  return (
    <AccordionItem value={value} className="border-b last:border-b-0">
      <AccordionTrigger className="py-5 font-heading text-base font-bold text-brand-navy-deep hover:no-underline sm:text-lg">
        {entry.question}
      </AccordionTrigger>
      <AccordionContent className="pb-5 text-base text-muted-foreground">{entry.answer}</AccordionContent>
    </AccordionItem>
  )
}
