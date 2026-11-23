import { AdminInfoRow } from "@/components/admin"
import { formatDateTimeSafe } from "@/lib/utils/format-date"
import { formatPhoneDisplay } from "@/lib/utils/format-phone-display"
import { getLgpdRequestTypeLabel } from "@/lib/utils/lgpd-labels"
import type { AdminLgpdRequest } from "@/types/api/lgpd-request.interface"

interface LgpdRequestDetailsProps {
  request: AdminLgpdRequest
}

const SECTION_CLASS = "flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm"
const SECTION_TITLE_CLASS = "font-heading font-black text-brand-navy-deep"

/** Requerente (o backend registra o acesso aos dados pessoais) e o pedido, com prazo e resposta. */
export function LgpdRequestDetails({ request }: LgpdRequestDetailsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="lgpd-holder-title" className={SECTION_CLASS}>
        <h2 id="lgpd-holder-title" className={SECTION_TITLE_CLASS}>Requerente</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <AdminInfoRow label="Nome" value={request.nome} />
          <AdminInfoRow label="CPF" value={request.cpfMascarado ?? "—"} />
          <AdminInfoRow label="E-mail" value={request.email ?? "—"} />
          <AdminInfoRow label="WhatsApp" value={request.whatsapp ? formatPhoneDisplay(request.whatsapp) : "—"} />
          <AdminInfoRow label="Aceite da política" value={formatDateTimeSafe(request.aceiteEm)} />
          {request.anonimizadaEm && <AdminInfoRow label="Anonimizado em" value={formatDateTimeSafe(request.anonimizadaEm)} />}
        </dl>
        <p className="text-xs text-muted-foreground">
          Confirme a identidade pelo contato informado antes de entregar ou apagar dados.
        </p>
      </section>

      <section aria-labelledby="lgpd-request-title" className={SECTION_CLASS}>
        <h2 id="lgpd-request-title" className={SECTION_TITLE_CLASS}>Pedido</h2>
        {request.vencida && (
          <p role="status" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
            Prazo vencido sem resposta final.
          </p>
        )}
        <dl className="flex flex-col gap-2 text-sm">
          <AdminInfoRow label="Tipo" value={getLgpdRequestTypeLabel(request.tipo)} />
          <AdminInfoRow label="Aberto em" value={formatDateTimeSafe(request.criadoEm)} />
          <AdminInfoRow label="Prazo" value={formatDateTimeSafe(request.prazoEm)} />
          {request.encerradaEm && <AdminInfoRow label="Encerrado em" value={formatDateTimeSafe(request.encerradaEm)} />}
        </dl>
        <h3 className="pt-2 text-sm font-bold text-brand-navy">Mensagem do titular</h3>
        <p className="text-sm whitespace-pre-line text-muted-foreground">{request.mensagem ?? "Sem mensagem."}</p>
        {request.resposta && (
          <>
            <h3 className="pt-2 text-sm font-bold text-brand-navy">Resposta</h3>
            <p className="text-sm whitespace-pre-line">{request.resposta}</p>
          </>
        )}
      </section>
    </div>
  )
}
