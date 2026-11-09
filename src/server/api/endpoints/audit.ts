import "server-only"

import type { AuditEntry } from "@/types/api/audit-entry.interface"
import type { CursorPage } from "@/types/api/cursor-page.interface"

import { adminFetch } from "../admin-fetch"

/** `GET /admin/auditoria?cursor&limit` */
export async function listAudit({ cursor, limit }: { cursor?: string; limit?: number } = {}): Promise<CursorPage<AuditEntry>> {
  return adminFetch("/admin/auditoria", { query: { cursor, limit } })
}
