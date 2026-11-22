import { unstable_rethrow } from "next/navigation"
import type { NextRequest } from "next/server"

import { parseIdParam } from "@/lib/utils/parse-id-param"
import { isApiError } from "@/server/api/api-error"
import { streamAdminRegistrationsCsv } from "@/server/api/endpoints/admin-registrations"

function textResponse(status: number, message: string): Response {
  return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } })
}

/**
 * Exporta os inscritos em CSV: repassa o corpo do backend em streaming (`GET /admin/eventos/:id/
 * inscricoes.csv`), com o Bearer só no servidor. Sem sessão, o `adminFetchStream` redireciona ao login.
 * O backend grava a auditoria `exportar` e o acesso a dados pessoais.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Download disparado por outro site (link forjado): não exporta.
  if (request.headers.get("sec-fetch-site") === "cross-site") return textResponse(403, "Acesso negado.")
  const eventId = parseIdParam((await params).id)
  if (eventId === null) return textResponse(404, "Corrida não encontrada.")

  try {
    const upstream = await streamAdminRegistrationsCsv(eventId)
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "text/csv; charset=utf-8",
        "Content-Disposition": upstream.headers.get("Content-Disposition") ?? `attachment; filename="inscricoes-corrida-${eventId}.csv"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) return textResponse(404, "Corrida não encontrada.")
    if (isApiError(error) && error.status === 403) return textResponse(403, "Acesso negado.")
    console.error("[export inscricoes]", error instanceof Error ? error.name : "erro desconhecido")
    return textResponse(502, "Não foi possível exportar as inscrições. Tente de novo em instantes.")
  }
}
