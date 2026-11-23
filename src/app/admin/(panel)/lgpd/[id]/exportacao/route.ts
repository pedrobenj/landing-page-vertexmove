import { unstable_rethrow } from "next/navigation"
import type { NextRequest } from "next/server"

import { parseIdParam } from "@/lib/utils/parse-id-param"
import { isApiError } from "@/server/api/api-error"
import { streamLgpdExport } from "@/server/api/endpoints/admin-lgpd"

function textResponse(status: number, message: string): Response {
  return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } })
}

/**
 * Exporta os dados do titular (`GET /admin/lgpd/solicitacoes/:id/exportacao`) como download JSON: o
 * Bearer fica no servidor e o corpo é repassado em streaming. Sem sessão, o `adminFetchStream` leva ao
 * login. O backend audita a exportação.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Download disparado por outro site (link forjado): não exporta.
  if (request.headers.get("sec-fetch-site") === "cross-site") return textResponse(403, "Acesso negado.")
  const id = parseIdParam((await params).id)
  if (id === null) return textResponse(404, "Solicitação não encontrada.")

  try {
    const upstream = await streamLgpdExport(id)
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": upstream.headers.get("Content-Disposition") ?? `attachment; filename="titular-solicitacao-${id}.json"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    unstable_rethrow(error)
    if (isApiError(error) && error.status === 404) return textResponse(404, "Solicitação não encontrada.")
    if (isApiError(error) && error.status === 403) return textResponse(403, "Acesso negado.")
    console.error("[export lgpd]", error instanceof Error ? error.name : "erro desconhecido")
    return textResponse(502, "Não foi possível exportar os dados. Tente de novo em instantes.")
  }
}
