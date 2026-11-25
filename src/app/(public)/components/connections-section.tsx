import { ArrowRight } from "lucide-react"

import { StaggerGroup } from "@/components/motion"
import { SectionBand, SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { getConnectionsContactHref } from "@/lib/utils"
import { getConnectionPhotos } from "@/server/content/connections"

import { ConnectionHighlightItem } from "./connection-highlight-item"
import { CONNECTION_HIGHLIGHTS } from "./connection-highlights"
import { ConnectionsGallery } from "./connections-gallery"

// TODO(cliente): texto oficial das Conexões.
/** Conexões: os treinos de sábado, o evento principal do Vertex. Logo depois das próximas corridas. */
export function ConnectionsSection() {
  const href = getConnectionsContactHref()
  const external = href.startsWith("https://")

  return (
    <SectionBand tone="dark" id="conexoes" aria-labelledby="conexoes-title" className="scroll-mt-16">
      <SectionHeading
        id="conexoes-title"
        tone="dark"
        eyebrow="Conexões"
        title="Todo sábado, um degrau juntos"
        description="As Conexões são os treinos do Vertex. Todo sábado o grupo se encontra para correr, puxar o ritmo de quem está chegando e celebrar cada subida."
        actions={
          <Button asChild variant="cta" size="xl" className="w-full normal-case tracking-normal sm:w-auto">
            <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              Quero participar
              <ArrowRight aria-hidden="true" />
            </a>
          </Button>
        }
      />
      <ConnectionsGallery photos={getConnectionPhotos()} />
      <StaggerGroup as="ul" aria-label="Como são as Conexões" className="grid gap-3 sm:grid-cols-3">
        {CONNECTION_HIGHLIGHTS.map((highlight) => (
          <ConnectionHighlightItem key={highlight.label} highlight={highlight} />
        ))}
      </StaggerGroup>
    </SectionBand>
  )
}
