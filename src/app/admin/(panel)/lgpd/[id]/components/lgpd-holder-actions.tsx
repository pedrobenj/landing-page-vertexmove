import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LGPD_REQUEST_TYPE } from "@/enums/lgpd-request-type.enum"
import { canAnonymizeLgpdRequest } from "@/lib/utils/lgpd-request-rules"
import type { AdminLgpdRequest } from "@/types/api/lgpd-request.interface"

import { AnonymizeHolderButton } from "./anonymize-holder-button"

interface LgpdHolderActionsProps {
  request: Pick<AdminLgpdRequest, "id" | "protocolo" | "nome" | "tipo" | "status" | "anonimizadaEm">
}

function anonymizeUnavailableReason(request: LgpdHolderActionsProps["request"]): string {
  if (request.anonimizadaEm) return "Os dados deste titular já foram anonimizados."
  if (request.tipo !== LGPD_REQUEST_TYPE.DELETION) return "A anonimização só vale para solicitações de eliminação dos dados."
  return "A solicitação foi recusada; para anonimizar, o titular precisa abrir uma nova."
}

/** Exportar (POST ao route handler: o navegador nunca vê o token) e anonimizar o titular. */
export function LgpdHolderActions({ request }: LgpdHolderActionsProps) {
  return (
    <section aria-labelledby="lgpd-holder-actions-title" className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm">
      <h2 id="lgpd-holder-actions-title" className="font-heading font-black text-brand-navy-deep">Dados do titular</h2>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Baixe um JSON com tudo o que está ligado a este CPF (cadastro, inscrições, pedidos e aceites) para atender pedidos de
          acesso ou portabilidade. O arquivo não traz o CPF, e o download fica registrado na auditoria.
        </p>
        {/* POST (ação auditada) ao route handler, que chama a API com o Bearer só no servidor. */}
        <form method="post" action={`/admin/lgpd/${request.id}/exportar`}>
          <Button type="submit" variant="outline" className="w-full sm:w-auto">
            <Download aria-hidden="true" />
            Exportar dados (JSON)
          </Button>
        </form>
      </div>
      <div className="flex flex-col gap-2 border-t pt-4">
        {canAnonymizeLgpdRequest(request) ? (
          <>
            <p className="text-sm text-muted-foreground">
              Anonimizar apaga nome, e-mail, WhatsApp, nascimento e o CPF cifrado do titular no cadastro, nas inscrições e nos pedidos.
              Valores, pagamentos, históricos e aceites continuam guardados, sem identificar a pessoa. Inscrição ou pedido aguardando
              pagamento impedem a anonimização.
            </p>
            <AnonymizeHolderButton requestId={request.id} protocolo={request.protocolo} nome={request.nome} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{anonymizeUnavailableReason(request)}</p>
        )}
      </div>
    </section>
  )
}
