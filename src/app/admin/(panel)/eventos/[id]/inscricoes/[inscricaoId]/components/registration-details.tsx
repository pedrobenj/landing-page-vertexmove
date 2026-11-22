import { AdminInfoRow } from "@/components/admin"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import { getReasonLabel } from "@/lib/utils/admin-registration-labels"
import { formatApiDate } from "@/lib/utils/format-api-date"
import { formatCurrency } from "@/lib/utils/format-currency"
import { formatDateTimeSafe } from "@/lib/utils/format-date"
import { formatPhoneDisplay } from "@/lib/utils/format-phone-display"
import type { ApiAdminRegistrationDetails } from "@/types/api/admin-registration.interface"

import { RegistrationAcceptanceItem } from "./registration-acceptance-item"
import { RegistrationHistoryItem } from "./registration-history-item"
import { RegistrationPaymentItem } from "./registration-payment-item"

interface RegistrationDetailsProps {
  registration: ApiAdminRegistrationDetails
}

const SECTION_CLASS = "flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm"
const SECTION_TITLE_CLASS = "font-heading font-black text-brand-navy-deep"

function safeApiDate(value: string): string {
  try {
    return formatApiDate(value)
  } catch {
    return value
  }
}

/** Atleta (com contato: a leitura é registrada pelo backend), inscrição, aceites, histórico e pagamentos. */
export function RegistrationDetails({ registration }: RegistrationDetailsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="athlete-title" className={SECTION_CLASS}>
        <h2 id="athlete-title" className={SECTION_TITLE_CLASS}>Atleta</h2>
        {registration.anonimizado && <p className="text-sm text-muted-foreground">Dados pessoais anonimizados (LGPD).</p>}
        <dl className="flex flex-col gap-2 text-sm">
          <AdminInfoRow label="Nome" value={registration.nomeCompleto} />
          <AdminInfoRow label="Nascimento" value={registration.dataNascimento ? safeApiDate(registration.dataNascimento) : "—"} />
          <AdminInfoRow label="CPF" value={registration.cpfMascarado ?? "—"} />
          <AdminInfoRow label="WhatsApp" value={registration.whatsapp ? formatPhoneDisplay(registration.whatsapp) : "—"} />
          <AdminInfoRow label="E-mail" value={registration.email ?? "—"} />
        </dl>
      </section>

      <section aria-labelledby="registration-title" className={SECTION_CLASS}>
        <h2 id="registration-title" className={SECTION_TITLE_CLASS}>Inscrição</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <AdminInfoRow label="Distância" value={registration.distancia.nome} />
          <AdminInfoRow label="Kit" value={registration.kit?.nome ?? "Sem kit"} />
          {registration.tamanhoCamisa && <AdminInfoRow label="Tamanho" value={registration.tamanhoCamisa} />}
          <AdminInfoRow label="Valor base" value={formatCurrency(registration.valorBaseCentavos)} />
          {registration.valorDescontoCentavos > 0 && (
            <AdminInfoRow label="Desconto" value={`− ${formatCurrency(registration.valorDescontoCentavos)}`} />
          )}
          <AdminInfoRow label="Total" value={formatCurrency(registration.valorTotalCentavos)} />
          <AdminInfoRow label="Inscrita em" value={formatDateTimeSafe(registration.inscritoEm)} />
          {registration.status === REGISTRATION_STATUS.PENDING && (
            <AdminInfoRow label="Reserva até" value={formatDateTimeSafe(registration.expiraEm)} />
          )}
          {registration.confirmadaEm && <AdminInfoRow label="Confirmada em" value={formatDateTimeSafe(registration.confirmadaEm)} />}
          {registration.encerradaEm && <AdminInfoRow label="Encerrada em" value={formatDateTimeSafe(registration.encerradaEm)} />}
          {registration.motivoEncerramento && <AdminInfoRow label="Motivo" value={getReasonLabel(registration.motivoEncerramento)} />}
          <AdminInfoRow label="Kit retirado em" value={registration.kitRetiradoEm ? formatDateTimeSafe(registration.kitRetiradoEm) : "—"} />
        </dl>
      </section>

      <section aria-labelledby="payments-title" className={SECTION_CLASS}>
        <h2 id="payments-title" className={SECTION_TITLE_CLASS}>Pagamentos</h2>
        {registration.pagamentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">O atleta ainda não foi ao pagamento.</p>
        ) : (
          <ul className="divide-y">
            {registration.pagamentos.map((payment) => (
              <RegistrationPaymentItem key={payment.id} payment={payment} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="history-title" className={SECTION_CLASS}>
        <h2 id="history-title" className={SECTION_TITLE_CLASS}>Histórico</h2>
        <ul className="divide-y">
          {registration.historico.map((change) => (
            <RegistrationHistoryItem key={`${change.statusNovo}-${change.em}`} change={change} />
          ))}
        </ul>
        <h3 className="pt-2 text-sm font-bold text-brand-navy">Aceites</h3>
        {registration.aceites.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum aceite registrado.</p>
        ) : (
          <ul className="divide-y">
            {registration.aceites.map((acceptance) => (
              <RegistrationAcceptanceItem key={`${acceptance.documentoTipo}-${acceptance.documentoVersao}`} acceptance={acceptance} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
