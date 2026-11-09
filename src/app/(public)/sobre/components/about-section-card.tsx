import { TextParagraph } from "@/components/sections"
import type { AboutSection } from "@/types/about-section.interface"

interface AboutSectionCardProps {
  section: AboutSection
}

/** "Nossa história" / "Missão": eyebrow, título e parágrafos num card. */
export function AboutSectionCard({ section }: AboutSectionCardProps) {
  return (
    <li>
      <article aria-labelledby={`${section.id}-title`} className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green-text">{section.eyebrow}</p>
        <h3 id={`${section.id}-title`} className="font-heading text-2xl font-black text-brand-navy-deep sm:text-3xl">
          {section.title}
        </h3>
        <div className="flex flex-col gap-3">
          {section.paragraphs.map((paragraph) => (
            <TextParagraph key={paragraph}>{paragraph}</TextParagraph>
          ))}
        </div>
      </article>
    </li>
  )
}
