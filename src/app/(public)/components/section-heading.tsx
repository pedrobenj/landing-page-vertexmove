import { Eyebrow } from "@/components/brand"

interface SectionHeadingProps {
  eyebrow: string
  title: string
  id?: string
}

export function SectionHeading({ eyebrow, title, id }: SectionHeadingProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="text-2xl font-extrabold uppercase text-brand-navy sm:text-3xl">
        {title}
      </h2>
    </div>
  )
}
