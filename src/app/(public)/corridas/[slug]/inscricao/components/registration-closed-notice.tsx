import { ArrowLeft, CalendarClock } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

interface RegistrationClosedNoticeProps {
  title: string
  description: string
  eventHref: string
}

/** Formulário indisponível (sem distâncias/documentos ainda, ou tudo esgotado). */
export function RegistrationClosedNotice({ title, description, eventHref }: RegistrationClosedNoticeProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-slate-50 p-8 text-center sm:p-12">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-navy-deep text-brand-green">
        <CalendarClock aria-hidden="true" className="size-6" />
      </span>
      <h2 className="font-heading text-2xl font-black text-brand-navy-deep">{title}</h2>
      <p className="max-w-md text-muted-foreground">{description}</p>
      <Button asChild variant="outline" size="xl" className="w-full sm:w-auto">
        <Link href={eventHref}>
          <ArrowLeft aria-hidden="true" />
          Voltar para a corrida
        </Link>
      </Button>
    </div>
  )
}
