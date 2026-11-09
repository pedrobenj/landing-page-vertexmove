import { ChevronListItem, TextParagraph } from "@/components/sections"
import type { PrivacySection } from "@/types/privacy-section.interface"

interface PrivacySectionBlockProps {
  section: PrivacySection
}

export function PrivacySectionBlock({ section }: PrivacySectionBlockProps) {
  return (
    <section aria-labelledby={`${section.id}-title`} className="flex flex-col gap-3 border-t pt-8 first:border-t-0 first:pt-0">
      <h2 id={`${section.id}-title`} className="font-heading text-2xl font-black text-brand-navy-deep">
        {section.title}
      </h2>
      {section.paragraphs.map((paragraph) => (
        <TextParagraph key={paragraph}>{paragraph}</TextParagraph>
      ))}
      {section.items && (
        <ul className="flex flex-col gap-2">
          {section.items.map((item) => (
            <ChevronListItem key={item}>{item}</ChevronListItem>
          ))}
        </ul>
      )}
    </section>
  )
}
