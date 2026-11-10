import Link from "next/link"

import { Button } from "@/components/ui/button"

interface EventLinkProps {
  slug: string
  label: string
}

export function EventLink({ slug, label }: EventLinkProps) {
  return (
    <Button asChild variant="outline" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
      <Link href={slug ? `/corridas/${slug}` : "/#corridas"}>{label}</Link>
    </Button>
  )
}
