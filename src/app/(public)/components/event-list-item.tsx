import { CalendarDays, MapPin } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import type { OpenEvent } from "@/types/open-event.interface"

interface EventListItemProps {
  event: OpenEvent
}

export function EventListItem({ event }: EventListItemProps) {
  return (
    <Card className="h-full">
      <CardHeader className="gap-2">
        <Badge className="bg-cta text-cta-foreground">Inscrições abertas</Badge>
        <CardTitle className="font-heading text-lg font-bold text-brand-navy">{event.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CalendarDays className="size-4" aria-hidden="true" />
          {formatDate(event.date)} · largada {event.startTime}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="size-4" aria-hidden="true" />
          {event.location}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="cta" size="lg" className="w-full">
          <Link href={`/corridas/${event.slug}`}>Ver corrida</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
