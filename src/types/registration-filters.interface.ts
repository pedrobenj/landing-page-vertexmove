import type { RegistrationStatus } from "@/generated/prisma/enums"

export interface RegistrationFilters {
  search: string
  modalityId: string | null
  status: RegistrationStatus | null
  kitPickedUp: boolean | null
  page: number
  pageSize: number
}
