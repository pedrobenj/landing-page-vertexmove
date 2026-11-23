import { unstable_rethrow } from "next/navigation"
import type { NextRequest } from "next/server"

import { parseIdParam } from "@/lib/utils/parse-id-param"
import { isApiError } from "@/server/api/api-error"
import { streamLgpdExport } from "@/server/api/endpoints/admin-lgpd"

function textResponse(status: number, message: string): Response {
  return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } })
}

/**
 * Exporta os dados do titular (`POST /admin/lgpd/solicitacoes/:id/exportar`) como download JSON. É POST
 * (formulário do detalhe) porque a exportação é uma ação auditada; o Bearer fica no servidor e o corpo é
 * repassado em streaming. Sem sessão, o `adminFetchStream` leva ao login.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Formulário enviado de outro site: não exporta (o cookie SameSite=Lax já não iria, isto é reforço).
  if (request.headers.get("sec-fetch-site") === "cross-site") return textResponse(403, "Acesso negado.")
  const id = parseIdParam((await params).id)
  if (id === null) return textResponse(404, "Solicitação não encontrada.")

  try {
    const upstream = await streamLgpdExport(id)
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": upstream.headers.get("Content-Disposition") ?? `attachment; filename="lgpd-solicitacao-${id}.json"`,
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
