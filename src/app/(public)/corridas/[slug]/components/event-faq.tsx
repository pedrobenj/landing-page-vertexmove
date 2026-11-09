import { Accordion } from "@/components/ui/accordion"
import { EVENT_FAQ } from "@/lib/utils"

import { EventFaqItem } from "./event-faq-item"

/** Perguntas frequentes da página do evento (textos genéricos, ver `EVENT_FAQ`). */
export function EventFaq() {
  return (
    <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5 shadow-sm sm:px-6">
      {EVENT_FAQ.map((entry, index) => (
        <EventFaqItem key={entry.question} entry={entry} value={`faq-${index}`} />
      ))}
    </Accordion>
  )
}
