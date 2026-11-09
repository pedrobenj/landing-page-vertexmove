import "server-only"

import type { EventDocument, EventDocumentInput } from "@/types/api/document.interface"

import { adminFetch } from "../admin-fetch"

/** `GET /admin/documentos?eventoId=` (array simples) */
export async function listDocuments(eventId: number): Promise<EventDocument[]> {
  return adminFetch("/admin/documentos", { query: { eventoId: eventId } })
}

/** `POST /admin/documentos` (201). Documentos são imutáveis: nova versão = novo documento. */
export async function createDocument(input: EventDocumentInput): Promise<EventDocument> {
  return adminFetch("/admin/documentos", { method: "POST", body: input })
}
