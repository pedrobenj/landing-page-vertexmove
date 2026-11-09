import { getContactChannels } from "@/lib/utils"

import { ContactChannelItem } from "./contact-channel-item"

export function ContactChannelList() {
  const channels = getContactChannels()

  return (
    <ul aria-label="Canais de contato" className="grid gap-4 md:grid-cols-3">
      {channels.map((channel) => (
        <ContactChannelItem key={channel.kind} channel={channel} />
      ))}
    </ul>
  )
}
