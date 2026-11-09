import { ArrowUpRight, AtSign, Mail, MessageCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ContactChannel, ContactChannelKind } from "@/types/contact-channel.interface"

const CHANNEL_ICONS = {
  whatsapp: MessageCircle,
  instagram: AtSign,
  email: Mail,
} satisfies Record<ContactChannelKind, unknown>

interface ContactChannelItemProps {
  channel: ContactChannel
}

/** Card de um canal de contato. Sem `href`, mostra "Em breve" sem link. */
export function ContactChannelItem({ channel }: ContactChannelItemProps) {
  const Icon = CHANNEL_ICONS[channel.kind]

  const content = (
    <>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-navy-deep text-brand-green">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-green-text">{channel.label}</span>
        <span className="font-heading text-lg font-black break-all text-brand-navy-deep">{channel.value}</span>
        <span className="text-sm text-muted-foreground">{channel.description}</span>
      </span>
    </>
  )

  const cardClassName = "flex h-full flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm"

  if (!channel.href) {
    return (
      <li>
        <div className={cardClassName}>{content}</div>
      </li>
    )
  }

  return (
    <li>
      <a
        href={channel.href}
        {...(channel.external && { target: "_blank", rel: "noopener noreferrer" })}
        className={cn(
          cardClassName,
          "group relative transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
        )}
      >
        {content}
        <ArrowUpRight
          aria-hidden="true"
          className="absolute top-6 right-6 size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
        {channel.external && <span className="sr-only">(abre em nova aba)</span>}
      </a>
    </li>
  )
}
