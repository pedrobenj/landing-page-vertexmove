"use server"

import { z } from "zod"

import { invalidInputResponse } from "@/lib/utils/invalid-input-response"
import { listAudit } from "@/server/api/endpoints/audit"
import { toErrorResponse } from "@/server/api/to-error-response"
import type { AuditEntry } from "@/types/api/audit-entry.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"
import type { HttpResponse } from "@/types/http-response.interface"

const AUDIT_ERROR_TITLE = "Não foi possível carregar a auditoria"

const listAuditSchema = z.object({ cursor: z.string().min(1).max(200).nullable() })

/** `GET /admin/auditoria?cursor` (o `adminFetch` exige a sessão; todos os papéis leem). */
export async function listAuditAction(input: z.input<typeof listAuditSchema>): Promise<HttpResponse<CursorPage<AuditEntry>>> {
  const parsed = listAuditSchema.safeParse(input)
  if (!parsed.success) return invalidInputResponse(AUDIT_ERROR_TITLE)

  try {
    const data = await listAudit({ cursor: parsed.data.cursor ?? undefined })
    return { status: 200, data }
  } catch (error) {
    return toErrorResponse(error, { title: AUDIT_ERROR_TITLE, context: "listAuditAction" })
  }
}
