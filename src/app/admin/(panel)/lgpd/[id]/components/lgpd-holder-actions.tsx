import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { AdminLgpdRequest } from "@/types/api/lgpd-request.interface"

import { AnonymizeHolderButton } from "./anonymize-holder-button"

interface LgpdHolderActionsProps {
  request: Pick<AdminLgpdRequest, "id" | "protocolo" | "nomeCompleto" | "titularEncontrado" | "anonimizadoEm">
}

/** Exportar (download pelo route handler: o navegador nunca vê o token) e anonimizar o titular. */
export function LgpdHolderActions({ request }: LgpdHolderActionsProps) {
  return (
    <section aria-labelledby="lgpd-holder-actions-title" className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm">
      <h2 id="lgpd-holder-actions-title" className="font-heading font-black text-brand-navy-deep">Dados do titular</h2>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Baixe um arquivo JSON com os dados e as inscrições do titular para atender pedidos de acesso ou portabilidade. O download fica registrado na auditoria.
        </p>
        <Button asChild variant="outline" className="w-full sm:w-auto sm:self-start">
          {/* `download` + route handler: o arquivo vem do servidor do Next, com o Bearer só lá. */}
          <a href={`/admin/lgpd/${request.id}/exportacao`} download>
            <Download aria-hidden="true" />
            Exportar dados (JSON)
          </a>
        </Button>
      </div>
      <div className="flex flex-col gap-2 border-t pt-4">
        {request.anonimizadoEm ? (
          <p className="text-sm text-muted-foreground">Os dados deste titular já foram anonimizados.</p>
        ) : request.titularEncontrado ? (
          <>
            <p className="text-sm text-muted-foreground">
              Anonimizar apaga nome, CPF, WhatsApp e e-mail do titular em todas as inscrições. Valores e pagamentos continuam guardados, sem identificar a pessoa.
            </p>
            <AnonymizeHolderButton requestId={request.id} protocolo={request.protocolo} nomeCompleto={request.nomeCompleto} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Sem inscrições com este CPF: não há dados para anonimizar.</p>
        )}
      </div>
    </section>
  )
}
