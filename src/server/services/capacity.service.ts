import "server-only"

import type { Prisma } from "@/generated/prisma/client"
import { RegistrationStatus } from "@/generated/prisma/enums"
import { db } from "@/server/db"

/** Filtro de inscrições que ocupam vaga: PAID ou PENDING ainda não expirada. */
export function activeRegistrationsWhere(now = new Date()): Prisma.RegistrationWhereInput {
  return {
    OR: [
      { status: RegistrationStatus.PAID },
      { status: RegistrationStatus.PENDING, expiresAt: { gt: now } },
    ],
  }
}

export async function countActiveRegistrations(modalityId: string): Promise<number> {
  return db.registration.count({
    where: { modalityId, ...activeRegistrationsWhere() },
  })
}

export async function isModalitySoldOut(modalityId: string, capacity: number): Promise<boolean> {
  return (await countActiveRegistrations(modalityId)) >= capacity
}
