import "server-only"

import { notFound } from "next/navigation"

import { parseIdParam } from "@/lib/utils/parse-id-param"
import type { AdminProfile } from "@/types/api/admin-auth.interface"
import type { AdminEvent } from "@/types/api/admin-event.interface"

import { loadAdminEvent } from "./load-admin-event"
import { requireAdminSession } from "./require-admin-session"

export type AdminEventPageData = { admin: AdminProfile; event: AdminEvent } | { error: true }

/**
 * Sessão + corrida de uma página do admin ligada a `/admin/eventos/[id]` (subpáginas de cadastro).
 * Id inválido ou 404 da API → `notFound()` (a página deve ser bloqueante, `instant = false`, para o 404
 * ser real). Os redirects de sessão sobem. Outras falhas → `{ error: true }`.
 */
export async function loadAdminEventPage(rawId: string): Promise<AdminEventPageData> {
  const eventId = parseIdParam(rawId)
  if (eventId === null) notFound()

  const [admin, result] = await Promise.all([requireAdminSession(), loadAdminEvent(eventId)])
  if ("notFound" in result) notFound()
  if ("error" in result) return { error: true }
  return { admin, event: result.event }
}

/** Título da aba: "<seção> — <nome da corrida>" (usa o mesmo `loadAdminEvent` memoizado da página). */
export async function getAdminEventPageTitle(rawId: string, section: string): Promise<string> {
  const eventId = parseIdParam(rawId)
  if (eventId === null) return section
  const result = await loadAdminEvent(eventId)
  return "event" in result ? `${section} — ${result.event.nome}` : section
}
