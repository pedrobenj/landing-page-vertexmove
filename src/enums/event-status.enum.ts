import { EventStatus } from "@/generated/prisma/enums"

export { EventStatus }

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  DRAFT: "Rascunho",
  OPEN: "Inscrições abertas",
  CLOSED: "Inscrições encerradas",
  FINISHED: "Realizada",
}
